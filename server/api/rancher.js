import WebSocket from 'ws';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Settings } from '/lib/collections';
import { Logger } from '/server/api';


export default class Rancher {

  constructor(apiKey, secret, env) {
    this.apiKey = apiKey || Settings.get('rancherApiKey');
    this.apiSecret = secret || Settings.get('rancherApiSecret');
    this.apiBaseUrl = Settings.get('rancherApiUrl');
    this.env = env || Settings.get('rancherDefaultEnv');

    if (!this.apiKey || !this.apiSecret) {
      throw new Meteor.Error('Missing Rancher API credentials.');
    }

    if (!this.apiBaseUrl) {
      throw new Meteor.Error('Missing Rancher host URL.');
    }

    if (!this.env) {
      throw new Meteor.Error('Missing default Rancher environment.');
    }

    this.hostname = this.apiBaseUrl.substr(this.apiBaseUrl.indexOf('//') + 2);
    this.apiVersion = '/v1/';
    this.apiFullUrl = this.apiBaseUrl + this.apiVersion;
    this.apiCredentials = new Buffer(`${this.apiKey}:${this.apiSecret}`).toString('base64');

    // fix Rancher's horrible API resource naming
    // (supposed to be fixed in API V2)
    this.convertApiNames = (resourceType) => {
      if (resourceType === 'stacks') {
        return 'environments';
      }
      return resourceType;
    };
  }


  create(resourceType, data) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call('POST', this.apiFullUrl + resource + '/', {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: data
    });
  }


  list(resourceType) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call('GET', this.apiFullUrl + resource + '/', {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    });
  }


  get(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call('GET', this.apiFullUrl + resource + '/' + id, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    });
  }


  update(resourceType, id, data) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call('PUT', this.apiFullUrl + resource + '/' + id, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: data
    });
  }


  delete(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    return HTTP.call('DELETE', this.apiFullUrl + resource + '/' + id, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    });
  }


  start(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    const action = resourceType === 'stacks' ? 'activateservices' : 'activate';
    const url = this.apiFullUrl + resource + '/' + id + '/?action=' + action;
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }


  setLinks(serviceId, links) {
    const url = `${this.apiFullUrl}services/${serviceId}/?action=setservicelinks`;
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        serviceLinks: links
      }
    });
  }


  addLoadBalancerLink(balancerId, serviceId, domains) {
    const url = `${this.apiFullUrl}loadbalancerservices/${balancerId}/?action=addservicelink`;

    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        serviceLink: {
          serviceId: serviceId,
          ports: _.isArray(domains) ? domains : [domains]
        }
      }
    });
  }


  removeLoadBalancerLink(balancerId, serviceId) {
    const url = `${this.apiFullUrl}loadbalancerservices/${balancerId}/?action=removeservicelink`;

    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        serviceLink: {
          serviceId: serviceId
        }
      }
    });
  }


  getStackServices(stackId) {
    return HTTP.call('GET', `${this.apiFullUrl}environments/${stackId}/services`, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    }).data.data;
  }


  getServiceContainers(serviceId) {
    return HTTP.call('GET', `${this.apiFullUrl}services/${serviceId}/instances`, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    }).data.data;
  }


  logs(containerId, callback) {
    const url = `${this.apiFullUrl}containers/${containerId}/?action=logs`;

    // get the websocket URL and token
    const logsSocket = HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        follow: true,
        lines: 100
      }
    });

    const socketUrl = `${logsSocket.data.url}?token=${logsSocket.data.token}`;
    const socket = new WebSocket(socketUrl);

    socket.on('open', () => {
      Logger.info('Rancher: Tailing logs for container ' + containerId);
    });

    socket.on('message', Meteor.bindEnvironment((msg) => {
      if (_.isFunction(callback)) {
        callback(null, msg, socket);
      } else {
        Logger.info(msg);
      }
    }));

    socket.on('error', (e) => {
      Logger.error(e);
      callback(e);
    });

    socket.on('close', () => {
      Logger.info('Rancher: Log tailing stopped for container ' + containerId);
    });
  }


  checkMongoState(containerId, callback) {
    // start streaming logs of mongo primary
    this.logs(containerId, (err, msg, socket) => {
      if (err) {
        callback(err);
      }

      // watch log output for replica set to be ready
      const readyStr = 'transition to primary complete; database writes are now permitted';
      if (msg && msg.includes(readyStr)) {
        socket.close();
        callback(null, true);
      }
    });
  }
}
