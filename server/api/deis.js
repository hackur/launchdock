import { HTTP } from 'meteor/http';
import { Settings } from '/lib/collections';
import { Logger } from '/server/api';


class Deis {

  constructor(options = {}) {

    const { url, username, password } = Settings.get('deis', {});

    const defaults = {
      apiVersion: 'v2',
      url: process.env.DEIS_URL || url,
      username: process.env.DEIS_USERNAME || username,
      password: process.env.DEIS_PASSWORD || password,
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

    if (!options.token) {
      if (!this.options.username || !this.options.password) {
        const msg = 'Missing Deis credentials.';
        Logger.error(msg);
        throw new Error(msg);
      }

      try {
        const result = this.login();
        this.options.token = result.data.token;
      } catch (e) {
        const msg = 'Failed to authenticate with Deis';
        Logger.error(e, msg);
        throw new Error(msg);
      }
    }
  }


  register(data) {
    const { apiBaseUrl, token } = this.options;

    const url = `${apiBaseUrl}/auth/register/`;

    Logger.debug({ data }, `[Deis API] POST ${url}`);

    const result = HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });

    Logger.info(`Username '${data.username}' successfully registered with Deis`);

    return result;
  }


  login(data) {
    const { apiBaseUrl, username, password } = this.options;

    const url = `${apiBaseUrl}/auth/login/`;

    Logger.debug({ data }, `[Deis API] POST ${url}`);

    const result = HTTP.call('POST', url, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: data || { username, password }
    });

    Logger.info(`Username '${data.username || username}' successfully authenticated with Deis`);

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


  getEnv(appId) {
    const url = `${this.options.apiBaseUrl}/apps/${appId}/config/`;
    Logger.debug(`[Deis API] GET ${url}`);
    return HTTP.call('GET', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      }
    }).data.values;
  }


  setEnv(appId, values) {
    const url = `${this.options.apiBaseUrl}/apps/${appId}/config/`;
    Logger.debug({ values }, `[Deis API] POST ${url}`);
    return HTTP.call('POST', url, {
      headers: {
        Authorization: `token ${this.options.token}`,
        Accept: 'application/json'
      },
      data: { values }
    });
  }


  unsetEnv(appId, keysToUnset = []) {
    const values = {};

    keysToUnset.forEach((key) => {
      values[key] = null;
    });

    const url = `${this.options.apiBaseUrl}/apps/${appId}/config/`;
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
