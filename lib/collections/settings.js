import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import simpleSchemaConfig from '../config/simple-schema';

simpleSchemaConfig();

const Settings = new Mongo.Collection('settings');

Settings.schema = new SimpleSchema({

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

  defaultPlatform: {
    type: String,
    optional: true,
    label: 'Default Deployment Platform',
    allowedValues: ['Rancher', 'Tutum'],
    defaultValue: 'Rancher',
    private: true
  },

  tutumUsername: {
    type: String,
    optional: true,
    label: 'Tutum Username',
    private: true
  },

  tutumToken: {
    type: String,
    optional: true,
    label: 'Tutum API Token',
    private: true
  },

  tutumBalancerUuid: {
    type: String,
    optional: true,
    label: 'Tutum Load Balancer UUID',
    private: true
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

  segmentKey: {
    type: String,
    optional: true,
    label: 'Segment.com API Key'
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

  slackWebhookUrl: {
    type: String,
    optional: true,
    label: 'Webhook URL',
    private: true
  },

  createdAt: {
    type: Date,
    label: 'Created',
    autoValue: function() {
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
    autoValue: function() {
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

Settings.get = (setting, defaultValue) => {
  const settings = Settings.find().fetch()[0];

  if (Meteor.isServer && Meteor.settings && !!Meteor.settings[setting]) {
    // if on the server, look in Meteor.settings
    return Meteor.settings[setting];

  } else if (Meteor.settings && Meteor.settings.public && !!Meteor.settings.public[setting]) {
    // look in Meteor.settings.public
    return Meteor.settings.public[setting];

  } else if(settings && (typeof settings[setting] !== 'undefined')) {
    // look in Settings collection
    return settings[setting];

  } else if (typeof defaultValue !== 'undefined') {

    // fallback to default
    return  defaultValue;
  }
  // or return undefined
  return undefined;
};

export default Settings;
