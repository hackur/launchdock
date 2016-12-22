import _ from 'lodash';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import simpleSchemaConfig from '../config/simple-schema';

simpleSchemaConfig();

const Settings = new Mongo.Collection('Settings');

Settings.schema = new SimpleSchema({

  app: {
    type: Object,
    optional: true,
    blackbox: true
  },

  siteTitle: {
    type: String,
    optional: true,
    label: 'Site Title'
  },

  adminEmail: {
    type: String,
    optional: true,
    label: 'Admin Email',
    private: true
  },

  mail: {
    type: Object,
    optional: true,
    blackbox: true
  },

  mailUrl: {
    type: String,
    optional: true,
    label: 'Mail URL'
  },

  docker: {
    type: Object,
    optional: true,
    blackbox: true
  },

  defaultAppImage: {
    type: String,
    optional: true,
    label: 'Default App Image',
    private: true
  },

  mongoImage: {
    type: String,
    optional: true,
    label: 'Mongo Image',
    private: true
  },

  loadBalancerEndpoint: {
    type: String,
    optional: true,
    label: 'Load Balancer Endpoint',
    private: true
  },

  wildcardDomain: {
    type: String,
    optional: true,
    label: 'Default Wildcard Domain',
    private: true
  },

  rancher: {
    type: Object,
    optional: true,
    blackbox: true
  },

  rancherApiUrl: {
    type: String,
    optional: true,
    label: 'Rancher API URL',
    private: true
  },

  rancherApiKey: {
    type: String,
    optional: true,
    label: 'Rancher API Key',
    private: true
  },

  rancherApiSecret: {
    type: String,
    optional: true,
    label: 'Rancher API Secret',
    private: true
  },

  rancherConnected: {
    type: Boolean,
    optional: true,
    defaultValue: false,
    private: true
  },

  rancherDefaultEnv: {
    type: String,
    optional: true,
    label: 'Rancher Default Environment',
    private: true
  },

  rancherDefaultBalancer: {
    type: String,
    optional: true,
    label: 'Rancher Default Load Balancer ID',
    private: true
  },

  rancherDefaultCert: {
    type: String,
    optional: true,
    label: 'Rancher Default Certificate ID',
    private: true
  },

  aws: {
    type: Object,
    optional: true,
    blackbox: true
  },

  awsKey: {
    type: String,
    optional: true,
    label: 'AWS Key',
    private: true
  },

  awsSecret: {
    type: String,
    optional: true,
    label: 'AWS Secret',
    private: true
  },

  awsRegion: {
    type: String,
    optional: true,
    label: 'AWS Region',
    private: true
  },

  segment: {
    type: Object,
    optional: true,
    blackbox: true
  },

  segmentKey: {
    type: String,
    optional: true,
    label: 'Segment.com API Key'
  },

  stripe: {
    type: Object,
    optional: true,
    blackbox: true
  },

  stripeMode: {
    type: String,
    optional: true,
    label: 'Mode',
    allowedValues: ['Test', 'Live'],
    defaultValue: 'Test',
    private: true
  },

  stripeTestPublishableKey: {
    type: String,
    optional: true,
    label: 'Test - Publishable Key'
  },

  stripeTestSecretKey: {
    type: String,
    optional: true,
    label: 'Test - Secret Key',
    private: true
  },

  stripeLivePublishableKey: {
    type: String,
    optional: true,
    label: 'Live - Publishable Key'
  },

  stripeLiveSecretKey: {
    type: String,
    optional: true,
    label: 'Live - Secret Key',
    private: true
  },

  ssl: {
    type: Object,
    optional: true,
    blackbox: true
  },

  sslPrivateKey: {
    type: String,
    optional: true,
    label: 'Private Key',
    private: true
  },

  sslCertificate: {
    type: String,
    optional: true,
    label: 'Certificate',
    private: true
  },

  sslRootCertificate: {
    type: String,
    optional: true,
    label: 'Root Certificate',
    private: true
  },

  intercom: {
    type: Object,
    optional: true,
    blackbox: true
  },

  intercomAppId: {
    type: String,
    optional: true,
    label: 'App Id',
    private: true
  },

  intercomApiKey: {
    type: String,
    optional: true,
    label: 'API key',
    private: true
  },

  kadira: {
    type: Object,
    optional: true,
    blackbox: true
  },

  kadiraAppId: {
    type: String,
    optional: true,
    label: 'App Id',
    private: true
  },

  kadiraAppSecret: {
    type: String,
    optional: true,
    label: 'App Secret',
    private: true
  },

  slack: {
    type: Object,
    optional: true,
    blackbox: true
  },

  slackWebhookUrl: {
    type: String,
    optional: true,
    label: 'Webhook URL',
    private: true
  },

  createdAt: {
    type: Date,
    label: 'Created',
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      }
      this.unset();
    },
    denyUpdate: true,
    private: true
  },

  updatedAt: {
    type: Date,
    label: 'Updated',
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
    private: true
  }
});

Settings.attachSchema(Settings.schema);

/**
 * Deny client side operations by default
 */
Settings.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});


/**
 * Get an app setting from the database or Meteor Settings
 * @param  {String} setting - a '.' delimited string representing the settings obj
 * @param  {Any} defaultValue - default value if nothing found
 * @return {Any} returns the setting or undefined
 */
Settings.get = (setting, defaultValue) => {
  const settings = Settings.findOne();

  if (Meteor.isServer && Meteor.settings && !!_.get(Meteor.settings, setting)) {
    // if on the server, look in Meteor.settings
    return _.get(Meteor.settings, setting);

  } else if (Meteor.settings.public && !!_.get(Meteor.settings.public, setting)) {
    // look in Meteor.settings.public
    return _.get(Meteor.settings.public, setting);

  } else if (settings && !!_.get(settings, setting)) {
    // look in Settings collection
    return _.get(settings, setting);

  } else if (typeof defaultValue !== 'undefined') {

    // fallback to default
    return  defaultValue;
  }
  // or return undefined
  return undefined;
};


/**
 * Set an app setting in the database
 * @param  {String} setting - a '.' delimited string representing the settings obj path
 * @param  {Any} value - the value to set
 * @param  {Function} callback - is passed an error or successfully updated document
 * @return {Object} returns the updated settings document
 */
Settings.set = (setting, value, callback) => {
  return Meteor.call('settings/set', setting, value, callback);
};


if (Meteor.isClient) {
  window.Settings = Settings;
}

if (Meteor.isServer) {
  global.Settings = Settings;
}


export default Settings;
