
Rancher = class Rancher {

  constructor(apiKey, secret, env) {
    this.apiKey = apiKey || Settings.get("rancherApiKey");
    this.apiSecret = secret || Settings.get("rancherApiSecret");
    this.apiCredentials = new Buffer(`${this.apiKey}:${this.apiSecret}`).toString("base64");
    this.apiVersion = "/v1/";
    this.apiBaseUrl = Settings.get("rancherApiUrl");
    this.hostname = this.apiBaseUrl.substr(this.apiBaseUrl.indexOf("//") + 2);
    this.apiFullUrl = this.apiBaseUrl + this.apiVersion;
    this.env = env || Settings.get("rancherDefaultEnv");

    this.checkCredentials = function() {
      if (!this.apiKey || !this.apiSecret) {
        throw new Meteor.Error("Missing Rancher API credentials.");
      }
    };

    // fix Rancher's horrible resource naming in their API
    // (supposed to be fixed in API V2)
    this.convertApiNames = (resourceType) => {
      if (resourceType === "stacks") {
        return "environments";
      } else {
        return resourceType;
      }
    }
  }


  create(resourceType, data) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call("POST", this.apiFullUrl + resource + "/", {
      headers: {
        "Authorization": `Basic ${this.apiCredentials}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: data
    });
  }


  list(resourceType) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call("GET", this.apiFullUrl + resource + "/", {
      headers: {
        "Authorization": `Basic ${this.apiCredentials}`,
        "Accept": "application/json"
      }
    });
  }


  get(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call("GET", this.apiFullUrl + resource + "/" + id, {
      headers: {
        "Authorization": `Basic ${this.apiCredentials}`,
        "Accept": "application/json"
      }
    });
  }


  update(resourceUri, data) {
    return HTTP.call("POST", this.apiBaseUrl + resourceUri, {
      headers: {
        "Authorization": `Basic ${this.apiCredentials}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: data
    });
  }


  delete(resourceUri) {
    return HTTP.call("DELETE", this.apiBaseUrl + resourceUri, {
      headers: {
        "Authorization": `Basic ${this.apiCredentials}`,
        "Accept": "application/json"
      }
    });
  }


  logs(containerUuid, callback) {
    const WebSocket = Npm.require("ws");

    // grab credentials
    const accessKey = this.apiKey;
    const secretKey = this.apiSecret;

    // parse the hostname out of the URL
    const baseUrl = this.apiBaseUrl;
    const host = baseUrl.substr(baseUrl.indexOf("//") + 2);

    // build the websocket URL
    const url = `wss://${accessKey}:${secretKey}@${host}/v1/subscribe?eventNames=resource.logs`;

    const socket = new WebSocket(url);

    socket.on('open', () => {
      Logger.info('Rancher: Tailing logs for container ' + containerUuid);
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
      Logger.info('Rancher: Log tailing stopped for container ' + containerUuid);
    });
  }

};
