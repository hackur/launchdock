/**
 * Monitor Tutum events over websocket stream API
 */

var WebSocket = Npm.require('ws');

var startEventsStream = function () {
  var tutum = new Tutum();
  tutum.checkCredentials();

  // make sure we have valid credentials
  try {
    tutum.list('stack');
  } catch(e) {
    throw new Meteor.Error("Failed to connect to Tutum API with provided credentials!");
  }

  // open a persistent websocket connection
  var url = 'wss://stream.tutum.co/v1/events?user='+tutum.username+'&token='+tutum.token;
  var socket = new WebSocket(url);

  socket.on('open', function() {
    console.log('Tutum events websocket opened');
  });

  socket.on('message', Meteor.bindEnvironment(function(messageStr) {
    var msg = JSON.parse(messageStr);

    // console.log(msg);
    // console.log("\n******************************************");
    // console.log("Type: " + msg.type);
    // console.log("Action: " + msg.action);
    // console.log("State: " + msg.state);
    // console.log("Resource URI: " + msg.resource_uri);
    // console.log("Date: " + moment(msg.date).format('LLL'));
    // console.log("Event UUID: " + msg.uuid);
    // console.log("******************************************");

    // If this message is for a stack that exists in the database, update its state
    if (msg.type == "stack" && !!Stacks.findOne({ uri: msg.resource_uri })) {
      Stacks.update({ uri: msg.resource_uri }, { $set: { state: msg.state } });
    }

    // If this message is for a service that exists in the database, update its state
    if (msg.type == "service" && !!Services.findOne({ uri: msg.resource_uri })) {
      Services.update({ uri: msg.resource_uri }, { $set: { state: msg.state } });
    }
  }));

  socket.on('close', Meteor.bindEnvironment(function() {
    console.warn('Tutum events websocket closed!');

    // reopen websocket if it closes
    startEventsStream();
  }));
};


Meteor.startup(function() {

  Settings.find().observe({
    // If the default settings doc has the credentials, try to connect.
    // This will always fire on app startup if credentials are already there.
    added: function (doc) {
      if (doc.tutumUsername && doc.tutumToken) {
        startEventsStream();
      }
    },
    // if the username or token has changed, try to connect
    changed: function (newDoc, oldDoc) {
      if (newDoc.tutumUsername !== oldDoc.tutumUsername ||
          newDoc.tutumToken    !== oldDoc.tutumToken) {
        console.log("Tutum API credentials changed.");
        startEventsStream();
      }
    }
  });

});
