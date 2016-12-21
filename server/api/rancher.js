import _ from 'lodash';
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

    this.hostname = this.apiBaseUrl.substr(this.apiBaseUrl.indexOf('//') + 2);
    this.apiVersion = '/v1/';
    this.apiFullUrl = this.apiBaseUrl + this.apiVersion; // `projects/${this.env}/`
    this.apiCredentials = new Buffer(`${this.apiKey}:${this.apiSecret}`).toString('base64');

    // fix Rancher's horrible API resource naming
    // (supposed to be fixed in API V2)
    this.convertApiNames = (resourceType) => {
      if (resourceType === 'stacks') {
        return 'environments';
      } else if (resourceType === 'environments') {
        return 'projects';
      }
      return resourceType;
    };
  }


  create(resourceType, data) {
    const resource = this.convertApiNames(resourceType);
    const url = this.apiFullUrl + resource + '/';
    Logger.info({ data }, `[Rancher API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  list(resourceType) {
    const resource = this.convertApiNames(resourceType);
    const url = this.apiFullUrl + resource + '/';
    Logger.info(`[Rancher API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    });
  }


  get(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    const url = this.apiFullUrl + resource + '/' + id;
    Logger.info(`[Rancher API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    });
  }


  update(resourceType, id, data) {
    const resource = this.convertApiNames(resourceType);
    const url = this.apiFullUrl + resource + '/' + id;
    Logger.info({ data }, `[Rancher API] PUT ${url}`);
    return HTTP.call('PUT', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  delete(resourceType, id) {
    const resource = this.convertApiNames(resourceType);
    const url = this.apiFullUrl + resource + '/' + id;
    Logger.info(`[Rancher API] DELETE ${url}`);
    return HTTP.call('DELETE', url, {
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
    Logger.info(`[Rancher API] POST ${url}`);
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
    const data = { serviceLinks: links };
    Logger.info({ data }, `[Rancher API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  addLoadBalancerLink(balancerId, serviceId, domains) {
    const url = `${this.apiFullUrl}loadbalancerservices/${balancerId}?action=addservicelink`;
    const data = {
      serviceLink: {
        serviceId: serviceId,
        ports: Array.isArray(domains) ? domains : [domains]
      }
    };
    Logger.info({ data }, `[Rancher API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  removeLoadBalancerLink(balancerId, serviceId) {
    const url = `${this.apiFullUrl}loadbalancerservices/${balancerId}/?action=removeservicelink`;
    const data = {
      serviceLink: {
        serviceId: serviceId
      }
    };
    Logger.info({ data }, `[Rancher API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  getStackServices(stackId) {
    const url = `${this.apiFullUrl}environments/${stackId}/services`;
    Logger.info(`[Rancher API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    }).data.data;
  }


  getServiceContainers(serviceId) {
    const url = `${this.apiFullUrl}services/${serviceId}/instances`;
    Logger.info(`[Rancher API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json'
      }
    }).data.data;
  }


  logs(containerId, callback) {
    const url = `${this.apiFullUrl}containers/${containerId}/?action=logs`;
    const data = {
      follow: true,
      lines: 100
    };
    Logger.info({ data }, `[Rancher API] GET ${url}`);

    // get the websocket URL and token
    const logsSocket = HTTP.call('POST', url, {
      headers: {
        Authorization: `Basic ${this.apiCredentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });

    const socketUrl = `${logsSocket.data.url}?token=${logsSocket.data.token}`;
    const socket = new WebSocket(socketUrl);

    socket.on('open', () => {
      Logger.info('[Rancher API] Tailing logs for container ' + containerId);
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
      Logger.info('[Rancher API] Log tailing stopped for container ' + containerId);
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
