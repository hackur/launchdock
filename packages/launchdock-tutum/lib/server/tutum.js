
Tutum = class Tutum {

  constructor(username, token) {
    this.username = username || Settings.get('tutumUsername');
    this.token = token || Settings.get('tutumToken');
    this.apiKey = new Buffer(`${this.username}:${this.token}`).toString('base64');
    this.apiBaseUrl = "https://dashboard.tutum.co";
    this.apiFullUrl = this.apiBaseUrl + "/api/v1/";
    this.loadBalancerUri = "/api/v1/service/56507358-5b58-4f33-a605-44d652dca9b6/";

    this.checkCredentials = function() {
      if (!this.username || !this.token) {
        throw new Meteor.Error("Missing Tutum API credentials.");
      }
    };
  }


  create(resourceType, data) {
    return HTTP.call("POST", this.apiFullUrl + resourceType + "/", {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: data
    });
  }


  list(resourceType) {
    return HTTP.call("GET", this.apiFullUrl + resourceType + "/", {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  get(resourceUri) {
    return HTTP.call("GET", this.apiBaseUrl + resourceUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  update(resourceUri, data) {
    return HTTP.call("PATCH", this.apiBaseUrl + resourceUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: data
    });
  }


  start(resourceUri) {
    return HTTP.call("POST", this.apiBaseUrl + resourceUri + "start/", {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  stop(resourceUri) {
    return HTTP.call("POST", this.apiBaseUrl + resourceUri + "stop/", {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  redeploy(resourceUri) {
    return HTTP.call("POST", this.apiBaseUrl + resourceUri + "redeploy/", {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  delete(resourceUri) {
    return HTTP.call("DELETE", this.apiBaseUrl + resourceUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json"
      }
    });
  }


  logs(containerUuid, callback) {

    const WebSocket = Npm.require('ws');
    const url = `wss://stream.tutum.co/v1/container/${containerUuid}/logs/`;

    const socket = new WebSocket(url, {
      headers: {
        Authorization: `Basic ${this.apiKey}`
      }
    });

    socket.on('open', () => {
      Logger.info('Tutum: Tailing logs for container ' + containerUuid);
    });

    socket.on('message', Meteor.bindEnvironment((messageStr) => {
      const msg = JSON.parse(messageStr);

      if (_.isFunction(callback)) {
        callback(null, msg, socket);
      } else {
        Logger.info(msg.log);
      }
    }));

    socket.on('error', (e) => {
      Logger.error(e);
      callback(e);
    });

    socket.on('close', () => {
      Logger.info('Tutum: Log tailing stopped for container ' + containerUuid);
    });
  }


  addLinkToLoadBalancer(linkedServiceName, linkedServiceUri) {
    if (!linkedServiceUri || !linkedServiceName) {
      throw new Meteor.Error("Tutum.addLinkToLoadBalancer: Missing balancer details.");
    }

    // Query the chosen load balancer to get the currently linked services
    let lb;
    try {
      lb = this.get(this.loadBalancerUri);
    } catch (e) {
      return e;
    }
    const currentLinks = lb.data.linked_to_service;

    // Build the new link
    const newLink = {
      "name": linkedServiceName,
      "to_service": linkedServiceUri
    };

    // Add new link to existing links
    currentLinks.push(newLink)

    // Update the load balancer
    return HTTP.call("PATCH", this.apiBaseUrl + this.loadBalancerUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        "linked_to_service": currentLinks
      }
    });
  }


  reloadLoadBalancers() {
    // Query the load balancer service to get the currently running containers
    let lb;
    try {
      lb = this.get(this.loadBalancerUri);
    } catch (e) {
      throw new Meteor.Error(e);
    }

    const lbContainers = lb.data.containers;

    var self = this;

    Logger.info("Redeploying 1st load balancer...");
    try {
      self.redeploy(lbContainers[0]);
    } catch (e) {
      throw new Meteor.Error(e);
    }

    Meteor.setTimeout(function() {
      Logger.info("Redeploying 2nd load balancer...");
      try {
        self.redeploy(lbContainers[1]);
      } catch (e) {
        throw new Meteor.Error(e);
      }
    }, 8000);
  }


  updateStackServices(services) {
    const self = this;

    _.each(services, (service_uri) => {
      let service;
      try {
        service = self.get(service_uri);
      } catch(e) {
        return e;
      }
      Services.update({ uri: service_uri }, {
        $set: {
          name: service.data.name,
          uuid: service.data.uuid,
          imageName: service.data.image_name,
          stack: service.data.stack,
          state: service.data.state,
          tags: service.data.tags,
          uri: service_uri
        }
      }, {
        upsert: true
      });
    });
  }


  updateEnvVars(serviceUri, newEnvVars) {
    if (!serviceUri || !newEnvVars) {
      throw new Meteor.Error("Tutum.updateEnvVars: Missing args.");
    }

    // Query the service to get the current env vars
    let service;
    try {
      service = this.get(serviceUri);
    } catch (e) {
      throw new Meteor.Error(e);
    }
    const currentEnvVars = service.data.container_envvars;

    // Add new env vars
    const updatedEnvVars = currentEnvVars.concat(newEnvVars);

    // Update the service
    return HTTP.call("PATCH", this.apiBaseUrl + serviceUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        "container_envvars": updatedEnvVars
      }
    });
  }


  addCustomSSL(serviceUri, opts) {

    if (!serviceUri || !opts.defaultDomain || !opts.customDomain || !opts.pem) {
      throw new Meteor.Error("Tutum.addCustomSSL: Missing args.");
    }

    // Query the service to get the current env vars
    let service;
    try {
      service = this.get(serviceUri);
    } catch (e) {
      throw new Meteor.Error(e);
    }

    let currentEnvVars = service.data.container_envvars;

    // check if there's a cert already
    let hasCert;
    for (let i = currentEnvVars.length - 1; i >= 0; i--) {
      if (currentEnvVars[i].key === "DEFAULT_SSL_CERT") {
        hasCert = true;
      }
    }

    // default domain
    const oldVHost = "http://" + opts.defaultDomain + ", ws://" + opts.defaultDomain +
                  ", https://" + opts.defaultDomain + ", wss://" + opts.defaultDomain;

    // custom domain
    const newRootUrl = "https://" + opts.customDomain;
    const newVHost = "http://" + opts.customDomain + ", ws://" + opts.customDomain +
                  ", https://" + opts.customDomain + ", wss://" + opts.customDomain;

    const updatedVHost = oldVHost + ", " + newVHost;

    // update env var array with new values
    for (let i = currentEnvVars.length - 1; i >= 0; i--) {
      // update ROOT_URL
      if (currentEnvVars[i].key === "ROOT_URL") {
        currentEnvVars[i].value = newRootUrl;
      }
      // update VIRTUAL_HOST
      if (currentEnvVars[i].key === "VIRTUAL_HOST") {
        currentEnvVars[i].value = updatedVHost;
      }
      // update cert if it exists, otherwise we'll add it to the array below
      if (currentEnvVars[i].key === "DEFAULT_SSL_CERT") {
        currentEnvVars[i].value = opts.pem;
      }
    }

    if (!hasCert) {
      // add SSL cert to env vars array if one didn't already exist
      currentEnvVars.push({
        key: "DEFAULT_SSL_CERT",
        value: opts.pem
      });
    }

    // Update the service
    return HTTP.call("PATCH", this.apiBaseUrl + serviceUri, {
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        "container_envvars": currentEnvVars
      }
    });
  }


  getStackServices(stackUri) {
    try {
      const stack = this.get(stackUri);
      return stack.data.services;
    } catch(e) {
      throw new Meteor.Error(e);
    }
  }


  getServiceContainers(serviceUri) {
    try {
      const service = this.get(serviceUri);
      return service.data.containers;
    } catch(e) {
      throw new Meteor.Error(e);
    }
  }


  checkMongoState(containerUuid, callback) {
    // start streaming logs of mongo primary
    this.logs(containerUuid, function(err, msg, socket) {
      if (err) {
        callback(err);
      }
      // watch log output for replica set to be ready
      const readyStr = "transition to primary complete; database writes are now permitted";
      if (msg.log && ~msg.log.indexOf(readyStr)) {
        socket.close();
        callback(null, true);
      }
    });
  }

};
