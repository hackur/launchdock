
Settings.get = function(setting, defaultValue) {
  var settings = Settings.find().fetch()[0];

  if (Meteor.isServer && Meteor.settings && !!Meteor.settings[setting]) { // if on the server, look in Meteor.settings
    return Meteor.settings[setting];

  } else if (Meteor.settings && Meteor.settings.public && !!Meteor.settings.public[setting]) { // look in Meteor.settings.public
    return Meteor.settings.public[setting];

  } else if(settings && (typeof settings[setting] !== 'undefined')) { // look in Settings collection
    return settings[setting];

  } else if (typeof defaultValue !== 'undefined') { // fallback to default
    return  defaultValue;

  } else { // or return undefined
    return undefined;
  }
};
