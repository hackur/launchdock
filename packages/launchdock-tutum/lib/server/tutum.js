
Tutum = function Tutum (username, token) {
  this.username = username || Settings.get('tutumUsername');
  this.token = token || Settings.get('tutumToken');
  this.apiBaseUrl = "https://dashboard.tutum.co";
  this.apiFullUrl = this.apiBaseUrl + "/api/v1/";

  this.checkCredentials = function () {
    if (!this.username || !this.token) {
      throw new Meteor.Error("Missing Tutum API credentials.");
    }
  };
}


Tutum.prototype.create = function (resourceType, data) {
  return HTTP.call("POST", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.list = function (resourceType) {
  return HTTP.call("GET", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.get = function (resourceUri) {
  return HTTP.call("GET", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.update = function (resourceUri, data) {
  return HTTP.call("PATCH", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.start = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "start/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.stop = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "stop/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.redeploy = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "redeploy/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.delete = function (resourceUri) {
  return HTTP.call("DELETE", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.addLinkToLoadBalancer = function (linkedServiceName, linkedServiceUri) {
  if (!linkedServiceUri || !linkedServiceName) {
    throw new Meteor.Error("Tutum.addLinkToLoadBalancer: Missing balancer details.")
  }

  // TODO: find and set best load balancer here
  var loadBalancerUri = "/api/v1/service/ea464a25-4af5-4c56-a2a3-c1468f280430/";

  // Query the chosen load balancer to get the currently linked services
  try {
    var lb = this.get(loadBalancerUri);
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
  return HTTP.call("PATCH", this.apiBaseUrl + loadBalancerUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: {
      "linked_to_service": currentLinks
    }
  });
};


Tutum.prototype.updateStackServices = function (services) {
  check(services, [String]);

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


Tutum.prototype.getServiceContainers = function (serviceUri) {
  check(serviceUri, String);

  try {
    var service = this.get(serviceUri);
    return service.data.containers;
  } catch(e) {
    return e;
  }
}


Tutum.prototype.checkMongoState = function (containerUuid, callback) {
  check(containerUuid, String);
  check(callback, Match.Optional(Function));

  var command = 'mongo --nodb /opt/mongo/upcheck.js';
  var url = 'wss://stream.tutum.co/v1/container/' + containerUuid + '/exec/?user=' + this.username + '&token=' + this.token;
      url += '&command=' + command;

  var WebSocket = Npm.require('ws');
  var socket = new WebSocket(url);

  socket.on('open', function() {
    console.log('Tutum shell websocket opened');
  });

  socket.on('message', function(messageStr) {
    var msg = JSON.parse(messageStr);
    // console.log(msg.output);
    if (msg.output === 'Mongo primary is ready for connections') {
      callback(null, true);
    }
  });

  socket.on('close', function() {
    console.log('Tutum shell websocket closed');
  });
}
