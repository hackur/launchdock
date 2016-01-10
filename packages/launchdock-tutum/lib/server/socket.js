/**
 * Monitor Tutum events over websocket stream API
 */

// https://www.npmjs.com/package/ws
const WebSocket = Npm.require('ws');

const startEventsStream = () => {
  const tutum = new Tutum();
  tutum.checkCredentials();

  // make sure we have valid credentials
  try {
    tutum.list('stack');
  } catch(e) {
    throw new Meteor.Error("Failed to connect to Tutum API with provided credentials!");
  }

  // open a persistent websocket connection
  const socket = new WebSocket("wss://stream.tutum.co/v1/events", {
    headers: {
      Authorization: `Basic ${tutum.apiKey}`
    }
  });

  socket.on('open', () => {
    Logger.info('Tutum events websocket opened');
  });

  socket.on('message', Meteor.bindEnvironment((messageStr) => {
    const msg = JSON.parse(messageStr);

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

  socket.on('close', Meteor.bindEnvironment(() => {
    Logger.warn('Tutum events websocket closed!');

    // reopen websocket if it closes
    startEventsStream();
  }));

  socket.on('error', Meteor.bindEnvironment((err) => {
    Logger.error(err);
  }));
};


Meteor.startup(() => {

  Settings.find().observe({
    // If the default settings doc has the credentials, try to connect.
    // This will always fire on app startup if credentials are already there.
    added(doc) {
      if (doc.tutumUsername && doc.tutumToken) {
        startEventsStream();
      }
    },
    // if the username or token has changed, try to connect
    changed(newDoc, oldDoc) {
      if (newDoc.tutumUsername !== oldDoc.tutumUsername ||
          newDoc.tutumToken    !== oldDoc.tutumToken) {
        Logger.info("Tutum API credentials changed.");
        startEventsStream();
      }
    }
  });

});
