
Tutum = function Tutum (username, token) {
  this.username = username || Settings.get('tutumUsername');
  this.token = token || Settings.get('tutumToken');

  this.checkCredentials = function () {
    if (!this.username || !this.token) {
      throw new Meteor.Error(407, "Missing Tutum API credentials.");
    }
  };
}


Tutum.prototype.create = function (resourceType, data) {
  return HTTP.call("POST", "https://dashboard.tutum.co/api/v1/" + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.list = function (resourceType) {
  return HTTP.call("GET", "https://dashboard.tutum.co/api/v1/" + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.get = function (resourceType, id) {
  return HTTP.call("GET", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.update = function (resourceType, id, data) {
  return HTTP.call("PATCH", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.start = function (resourceType, id) {
  return HTTP.call("POST", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/start/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.stop = function (resourceType, id) {
  return HTTP.call("POST", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/stop/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.redeploy = function (resourceType, id) {
  return HTTP.call("POST", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/redeploy/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.delete = function (resourceType, id) {
  return HTTP.call("DELETE", "https://dashboard.tutum.co/api/v1/" + resourceType + "/" + id + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.addLinkToLoadBalancer = function (linkedServiceId, linkedServiceName) {
  // TODO: find and set best load balancer here
  return HTTP.call("PATCH", "https://dashboard.tutum.co/api/v1/service/ea464a25-4af5-4c56-a2a3-c1468f280430/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: {
      "linked_to_service": [{
        "to_service": "/api/v1/service/" + linkedServiceId + "/",
        "name": linkedServiceName
      }]
    }
  });
};
