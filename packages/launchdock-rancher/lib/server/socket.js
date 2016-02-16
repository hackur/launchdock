/**
 * Monitor Rancher events over websocket stream API
 */

// https://www.npmjs.com/package/ws
const WebSocket = Npm.require("ws");

const startEventsStream = () => {

  const rancher = new Rancher();
  rancher.checkCredentials();

  // grab Rancher credentials
  const accessKey = rancher.apiKey;
  const secretKey = rancher.apiSecret;

  // grab the hostname
  const host = rancher.hostname;

  // build the websocket URL
  const url = `wss://${accessKey}:${secretKey}@${host}/v1/subscribe?eventNames=resource.change`;

  const socket = new WebSocket(url);

  socket.on("open", () => {
    Logger.info("Rancher events websocket opened");
  });

  socket.on("message", Meteor.bindEnvironment((messageStr) => {
    const msg = JSON.parse(messageStr);
    // Logger.info("Rancher event", msg);

    if (msg.name == "resource.change" && msg.data) {

      const resource = msg.data.resource;

      if (resource.type == "service" || resource.type == "environment") {
        // convert "environent" to "stack" until Rancher fixes that nonsense in the API
        const resourceType = (resource.type == "environment") ? "stack" : resource.type;

        const msgType = (resource.transitioning === "error") ? "ERROR" : "INFO";

        // console.log("\n******************************************");
        // console.log(`Type: ${resourceType}`);
        // console.log(`ID: ${resource.id}`);
        // console.log(`Name: ${resource.name}`);
        // console.log(`State: ${resource.state}`);
        //
        // if (resource.transitioningMessage) {
        //   console.log(`Msg Type: ${msgType}`);
        //   console.log(`Message: ${resource.transitioningMessage}`);
        // }
        //
        // console.log("******************************************");

        // convert a few state strings to preferred names
        let state;
        switch (resource.state) {
          case "activating":
            state = "Starting";
            break;
          case "active":
            state = "Running";
            break;
          default:
            state = resource.state;
        }

        // If this message is for a stack that exists in the database, update its state
        if (resourceType == "stack" && !!Stacks.findOne({ rancherId: resource.id })) {
          Stacks.update({ rancherId: resource.id }, { $set: { state: state } });
        }

        // If this message is for a service that exists in the database, update its state
        if (resourceType == "service" && !!Services.findOne({ rancherId: resource.id })) {
          Services.update({ rancherId: resource.id }, { $set: { state: state } });
        }
      }

    }
  }));

  socket.on("error", Meteor.bindEnvironment((err) => {
    Logger.error("Rancher events websocket error!", err);
  }));

  socket.on("close", Meteor.bindEnvironment(() => {
    Logger.warn("Rancher events websocket closed!");

    // reopen websocket if it closes
    startEventsStream();
  }));
};


Meteor.startup(() => {

  Settings.find().observe({
    // If the default settings doc has the credentials, try to connect.
    // This will always fire on app startup if credentials are already there.
    added(doc) {
      if (doc.rancherApiKey && doc.rancherApiSecret) {
        startEventsStream();
      }
    },
    // if the API credentials have changed, try to connect
    changed(newDoc, oldDoc) {
      if (newDoc.rancherApiKey !== oldDoc.rancherApiKey ||
          newDoc.rancherApiSecret    !== oldDoc.rancherApiSecret) {
        Logger.info("Rancher API credentials changed.");
        startEventsStream();
      }
    }
  });

});
