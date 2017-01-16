import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Services = new Mongo.Collection('Services');

Services.schema = new SimpleSchema({

  name: {
    type: String,
    optional: false
  },

  type: {
    type: String,
    optional: true
  },

  imageName: {
    type: String,
    optional: true
  },

  rancherId: {
    type: String,
    optional: true
  },

  uuid: {
    type: String,
    optional: true
  },

  uri: {
    type: String,
    optional: true
  },

  envVars: {
    type: Object,
    optional: true
  },

  stackId: {
    type: String,
    optional: true
  },

  state: {
    type: String,
    optional: true
  },

  containers: Array,

  'containers.$': {
    type: String,
    optional: true
  },

  tags: Array,

  'tags.$.name': {
    type: String,
    optional: true
  },

  userId: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return this.userId;
      }
    }
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
 * Attach schema to Services collection
 */
Services.attachSchema(Services.schema);

/**
 * Deny client side operations by default
 */
Services.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Services;
