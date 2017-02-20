import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Apps = new Mongo.Collection('Apps');

Apps.schema = new SimpleSchema({

  name: {
    type: String,
    optional: true
  },

  image: {
    type: String,
    optional: true
  },

  deis: {
    type: Object,
    optional: true,
    blackbox: true
  },

  domains: {
    type: Array,
    optional: true
  },

  'domains.$': {
    type: String,
    optional: true
  },

  defaultDomain: {
    type: String,
    optional: true
  },

  envVars: {
    type: Object,
    optional: true
  },

  state: {
    type: String,
    optional: true
  },

  endpoint: {
    type: String,
    optional: true
  },

  userId: {
    type: String,
    optional: true
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
    }
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
    optional: true
  },

  lastUpdatedBy: {
    type: String,
    optional: true,
    denyInsert: true,
    autoValue() {
      if (this.isUpdate && this.userId) {
        return this.userId;
      }
    }
  }

});

/**
 * Attach schema to Apps collection
 */
Apps.attachSchema(Apps.schema);

/**
 * Deny client side operations by default
 */
Apps.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Apps;
