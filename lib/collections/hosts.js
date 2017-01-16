import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Hosts = new Mongo.Collection('Hosts');

Hosts.schema = new SimpleSchema({

  name: {
    type: String,
    optional: false
  },

  clusterId: {
    type: String,
    optional: true
  },

  type: {
    type: String,
    optional: true
  },

  rancherId: {
    type: String,
    optional: true
  },

  rancherAccountId: {
    type: String,
    optional: true
  },

  state: {
    type: String,
    optional: true
  },

  amazonec2Config: {
    type: Object,
    optional: true
  },

  labels: {
    type: Object,
    optional: true
  },

  ipAddress: {
    type: String,
    optional: true
  },

  provider: {
    type: String,
    optional: true,
    allowedValues: ['aws', 'digital-ocean']
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

  createdBy: {
    type: String,
    optional: true,
    denyUpdate: true,
    autoValue() {
      if (this.isInsert && this.userId) {
        return this.userId;
      }
    }
  }

});

/**
 * Deny client side operations by default
 */
Hosts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Hosts;
