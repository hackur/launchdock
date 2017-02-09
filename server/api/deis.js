import _ from 'lodash';
import { HTTP } from 'meteor/http';
import { Settings } from '/lib/collections';
import { Logger } from '/server/api';


class Deis {

  constructor(options = {}) {

    const { url, username, password, token } = Settings.get('deis', {});

    const defaults = {
      apiVersion: 'v2',
      url: process.env.DEIS_URL || url,
      username: process.env.DEIS_USERNAME || username,
      password: process.env.DEIS_PASSWORD || password,
      token: process.env.DEIS_TOKEN || token,
      secure: true
    };

    this.options = Object.assign({}, defaults, options);

    this.options.apiBaseUrl = `${this.options.url}/${this.options.apiVersion}`;

    Logger.debug(`Deis options: \n${JSON.stringify(this.options, null, 2)}`);

    if (!this.options.url) {
      const msg = 'Missing Deis controller URL.';
      Logger.error(msg);
      throw new Error(msg);
    }

    if (!this.options.username || !this.options.password) {
      const msg = 'Missing Deis credentials.';
      Logger.error(msg);
      throw new Error(msg);
    }
  }


  register(data) {
    const { apiBaseUrl } = this.options;

    const url = `${apiBaseUrl}/auth/register/`;

    Logger.info({ data }, `[Deis API] POST ${url}`);

    return HTTP.call('POST', url, {
      headers: {
        'Content-Type': 'application/json'
      },
      data
    });
  }


  login(data) {
    const { apiBaseUrl, username, password } = this.options;

    const url = `${apiBaseUrl}/auth/login/`;

    Logger.info({ data }, `[Deis API] POST ${url}`);

    let result;
    try {
      result = HTTP.call('POST', url, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: data || { username, password }
      });
    } catch(err) {
      Logger.error(err);
      throw new Error(err);
    }

    const settings = Settings.findOne();
    const update = _.set(settings, 'deis.token', result.data.token);

    try {
      Settings.update({ _id: settings._id }, {
        $set: update
      });
    } catch(e) {
      const msg = 'Deis token update failed';
      Logger.error(e, msg);
      throw new Error(msg);
    }

    Logger.info('Successfully authenticated with Deis');

    return result;
  }


  create(resource, data) {
    const url = `${this.options.apiBaseUrl}/${resource}/`;
    Logger.debug({ data }, `[Deis API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  list(resource) {
    const url = `${this.options.apiBaseUrl}/${resource}/`;
    Logger.debug(`[Deis API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      }
    });
  }


  get(resource, id) {
    const url = `${this.options.apiBaseUrl}/${resource}/${id}/`;
    Logger.debug(`[Deis API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      }
    });
  }


  update(resource, id, data) {
    const url = `${this.options.apiBaseUrl}/${resource}/${id}/`;
    Logger.debug({ data }, `[Deis API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
  }


  delete(resource, id) {
    const url = `${this.options.apiBaseUrl}/${resource}/${id}/`;
    Logger.debug(`[Deis API] DELETE ${url}`);
    return HTTP.call('DELETE', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      }
    });
  }


  getEnv(id) {
    const url = `${this.options.apiBaseUrl}/apps/${id}/config/`;
    Logger.debug(`[Deis API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      }
    }).data.values;
  }


  setEnv(id, values) {
    const url = `${this.options.apiBaseUrl}/apps/${id}/config/`;
    Logger.debug({ values }, `[Deis API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      },
      data: { values }
    });
  }


  unsetEnv(id, keysToUnset = []) {
    const values = {};

    keysToUnset.forEach((key) => {
      values[key] = null;
    });

    const url = `${this.options.apiBaseUrl}/apps/${id}/config/`;
    Logger.debug({ data: values }, `[Deis API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      },
      data: { values }
    });
  }

}

export default Deis;
