/**
 * Monitor Rancher events over websocket stream API
 */

// https://www.npmjs.com/package/ws
var WebSocket = Npm.require("ws");

var startEventsStream = function () {
  const rancher = new Rancher();
  rancher.checkCredentials();

  // open a persistent websocket connection
  const accessKey = rancher.apiKey;
  const secretKey = rancher.apiSecret;
  const host = rancher.apiBaseUrl;
  const url = `wss://${accessKey}:${secretKey}@${host}/v1/subscribe?eventNames=resource.change`;

  const socket = new WebSocket(url);

  socket.on("open", function() {
    Logger.info("Rancher events websocket opened");
  });

  socket.on("message", Meteor.bindEnvironment(function(messageStr) {
    const msg = JSON.parse(messageStr);
    // Logger.info("Rancher event", msg);

    if (msg.name == "resource.change" && msg.data) {

      const resource = msg.data.resource;

      let info = `name=${resource.name} state=${resource.state}`;

      if ( resource.transitioning !== 'no' ) {
        info += ` transitioning=${resource.transitioning} message=${resource.transitioningMessage}`;
      }

      console.log(`type: ${msg.resourceType} id: ${msg.resourceId} changed: ${info}`);
    }

    // console.log("\n******************************************");
    // console.log("Type: " + msg.resourceType);
    // console.log("ID: " + msg.resourceId);
    // console.log("Action: " + msg.action);
    // console.log("State: " + msg.state);
    // console.log("Resource URI: " + msg.resource_uri);
    // console.log("Date: " + moment(msg.date).format("LLL"));
    // console.log("Event UUID: " + msg.uuid);
    // console.log("******************************************");

    // // If this message is for a stack that exists in the database, update its state
    // if (msg.type == "stack" && !!Stacks.findOne({ uri: msg.resource_uri })) {
    //   Stacks.update({ uri: msg.resource_uri }, { $set: { state: msg.state } });
    // }
    //
    // // If this message is for a service that exists in the database, update its state
    // if (msg.type == "service" && !!Services.findOne({ uri: msg.resource_uri })) {
    //   Services.update({ uri: msg.resource_uri }, { $set: { state: msg.state } });
    // }
  }));

  socket.on("error", Meteor.bindEnvironment(function(err) {
    Logger.error("Rancher events websocket error!");
    Logger.error(err);
  }));

  socket.on("close", Meteor.bindEnvironment(function() {
    Logger.warn("Rancher events websocket closed!");

    // reopen websocket if it closes
    startEventsStream();
  }));
};


Meteor.startup(function() {

  Settings.find().observe({
    // If the default settings doc has the credentials, try to connect.
    // This will always fire on app startup if credentials are already there.
    added: function (doc) {
      if (doc.rancherApiKey && doc.rancherApiSecret) {
        startEventsStream();
      }
    },
    // if the API credentials have changed, try to connect
    changed: function (newDoc, oldDoc) {
      if (newDoc.rancherApiKey !== oldDoc.rancherApiKey ||
          newDoc.rancherApiSecret    !== oldDoc.rancherApiSecret) {
        Logger.info("Rancher API credentials changed.");
        startEventsStream();
      }
    }
  });

});
