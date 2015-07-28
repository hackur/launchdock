Meteor.publish('settings', function() {
  var options = {};
  var privateFields = {};

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
