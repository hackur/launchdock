Meteor.publish("settings", function() {
  let options = {};
  let privateFields = {};

  // look at Settings.schema._schema to see which fields should be kept private
  _.each(Settings.simpleSchema()._schema, function (property, key) {
    if (property.autoform && property.autoform.private) {
      privateFields[key] = false;
    }
  });

  if(!Users.is.admin(this.userId)){
    options = _.extend(options, {
      fields: privateFields
    });
  }

  return Settings.find({}, options);
});


// public settings for use on all routes (client-side analytics, etc.)
Meteor.publish("public-settings", function() {
  let options = {};
  let privateFields = {};

  // look at Settings.schema._schema to see which fields should be kept private
  _.each(Settings.simpleSchema()._schema, function (property, key) {
    if (property.autoform && property.autoform.private) {
      privateFields[key] = false;
    }
  });

  options = _.extend(options, {
    fields: privateFields
  });

  return Settings.find({}, options);
});


// platform settings for stack creation page
Meteor.publish("platform-settings", function() {
  if (Users.is.admin(this.userId)) {
    return Settings.find({}, {
      fields: {
        defaultPlatform: 1
      }
    });
  }
});
