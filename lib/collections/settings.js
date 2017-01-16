import _ from 'lodash';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import simpleSchemaConfig from '../config/simple-schema';

simpleSchemaConfig();

const Settings = new Mongo.Collection('Settings');

Settings.schema = new SimpleSchema({

  app: {
    type: Object,
    optional: true,
    blackbox: true
  },

  mail: {
    type: Object,
    optional: true,
    blackbox: true
  },

  docker: {
    type: Object,
    optional: true,
    blackbox: true
  },

  loadBalancerEndpoint: {
    type: String,
    optional: true,
    label: 'Load Balancer Endpoint',
    private: true
  },

  rancher: {
    type: Object,
    optional: true,
    blackbox: true
  },

  aws: {
    type: Object,
    optional: true,
    blackbox: true
  },

  segment: {
    type: Object,
    optional: true,
    blackbox: true
  },

  stripe: {
    type: Object,
    optional: true,
    blackbox: true
  },

  ssl: {
    type: Object,
    optional: true,
    blackbox: true
  },

  intercom: {
    type: Object,
    optional: true,
    blackbox: true
  },

  kadira: {
    type: Object,
    optional: true,
    blackbox: true
  },

  slack: {
    type: Object,
    optional: true,
    blackbox: true
  },

  createdAt: {
    type: Date,
    label: 'Created',
    autoValue() {
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
    autoValue() {
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
