
Tutum = function Tutum (username, token) {
  this.username = username || Settings.get('tutumUsername');
  this.token = token || Settings.get('tutumToken');
  this.apiKey = new Buffer(`${this.username}:${this.token}`).toString('base64');
  this.apiBaseUrl = "https://dashboard.tutum.co";
  this.apiFullUrl = this.apiBaseUrl + "/api/v1/";
  this.loadBalancerUri = "/api/v1/service/56507358-5b58-4f33-a605-44d652dca9b6/";

  this.checkCredentials = function () {
    if (!this.username || !this.token) {
      throw new Meteor.Error("Missing Tutum API credentials.");
    }
  };
}


Tutum.prototype.create = function (resourceType, data) {
  return HTTP.call("POST", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.list = function (resourceType) {
  return HTTP.call("GET", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.get = function (resourceUri) {
  return HTTP.call("GET", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.update = function (resourceUri, data) {
  return HTTP.call("PATCH", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.start = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "start/", {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.stop = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "stop/", {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.redeploy = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "redeploy/", {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.delete = function (resourceUri) {
  return HTTP.call("DELETE", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": `Basic ${this.apiKey}`,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.logs = function (containerUuid, callback) {
  var url = 'wss://stream.tutum.co/v1/container/' + containerUuid +
            '/logs/?user=' + this.username + '&token=' + this.token;

  var WebSocket = Npm.require('ws');
  var socket = new WebSocket(url);

  socket.on('open', function() {
    Logger.info('Tutum: Tailing logs for container ' + containerUuid);
  });

  socket.on('message', Meteor.bindEnvironment(function(messageStr) {
    var msg = JSON.parse(messageStr);

    if (_.isFunction(callback)) {
      callback(null, msg, socket);
    } else {
      Logger.info(msg.log);
    }
  }));

  socket.on('error', function(e) {
    Logger.error(e);
    callback(e);
  });

  socket.on('close', function() {
    Logger.info('Tutum: Log tailing stopped for container ' + containerUuid);
  });
}


Tutum.prototype.addLinkToLoadBalancer = function (linkedServiceName, linkedServiceUri) {
  if (!linkedServiceUri || !linkedServiceName) {
    throw new Meteor.Error("Tutum.addLinkToLoadBalancer: Missing balancer details.");
  }

  // Query the chosen load balancer to get the currently linked services
  try {
    var lb = this.get(this.loadBalancerUri);
  } catch (e) {
    return e;
  }
  var currentLinks = lb.data.linked_to_service;

  // Build the new link
  var newLink = {
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
};


Tutum.prototype.reloadLoadBalancers = function () {

  // Query the load balancer service to get the currently running containers
  try {
    var lb = this.get(this.loadBalancerUri);
  } catch (e) {
    throw new Meteor.Error(e);
  }

  lbContainers = lb.data.containers;

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
};


Tutum.prototype.updateStackServices = function (services) {
  var self = this;

  _.each(services, function (service_uri) {
    try {
      var service = self.get(service_uri);
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


Tutum.prototype.updateEnvVars = function (serviceUri, newEnvVars) {
  if (!serviceUri || !newEnvVars) {
    throw new Meteor.Error("Tutum.updateEnvVars: Missing args.");
  }

  // Query the service to get the current env vars
  try {
    var service = this.get(serviceUri);
  } catch (e) {
    throw new Meteor.Error(e);
  }
  var currentEnvVars = service.data.container_envvars;

  // Add new env vars
  var updatedEnvVars = currentEnvVars.concat(newEnvVars);

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
};


Tutum.prototype.addCustomSSL = function (serviceUri, opts) {

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
  };

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
};


Tutum.prototype.getStackServices = function (stackUri) {
  try {
    var stack = this.get(stackUri);
    return stack.data.services;
  } catch(e) {
    throw new Meteor.Error(e);
  }
}


Tutum.prototype.getServiceContainers = function (serviceUri) {
  try {
    var service = this.get(serviceUri);
    return service.data.containers;
  } catch(e) {
    throw new Meteor.Error(e);
  }
}


Tutum.prototype.checkMongoState = function (containerUuid, callback) {
  // start streaming logs of mongo primary
  this.logs(containerUuid, function(err, msg, socket) {
    if (err) {
      callback(err);
    }
    // watch log output for replica set to be ready
    var readyStr = "transition to primary complete; database writes are now permitted";
    if (msg.log && ~msg.log.indexOf(readyStr)) {
      socket.close();
      callback(null, true);
    }
  });
}
