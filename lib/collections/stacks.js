/**
 * Stacks schema
 * @type {SimpleSchema}
 */

Stacks = new Mongo.Collection('stacks');

Stacks.schema = new SimpleSchema({

  name: {
    type: String,
    optional: false
  },

  uuid: {
    type: String,
    optional: true
  },

  uri: {
    type: String,
    optional: true
  },

  state: {
    type: String,
    optional: true
  },

  services: {
    type: [String],
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
    },
    denyUpdate: true
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
 * Attach schema to Stacks collection
 */
Stacks.attachSchema(Stacks.schema);
