/**
 * Services schema
 * @type {SimpleSchema}
 */

Services = new Mongo.Collection('services');

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

  uuid: {
    type: String,
    optional: true
  },

  uri: {
    type: String,
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

  containers: {
    type: [String],
    optional: true
  },

  tags: {
    type: [Object],
    optional: true
  },

  "tags.$.name": {
    type: String,
    optional: true
  },

  userId: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      }
    }
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
      } else {
        this.unset();
      }
    }
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
    optional: true
  },

  lastUpdatedBy: {
    type: String,
    optional: true,
    denyInsert: true,
    autoValue: function () {
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
