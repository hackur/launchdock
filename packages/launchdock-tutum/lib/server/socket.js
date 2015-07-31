/**
 * Monitor Tutum events over websocket stream API
 */

var WebSocket = Npm.require('ws');
var username = Settings.get('tutumUsername');
var token = Settings.get('tutumToken');

Meteor.startup(function() {

  if (!username || !token) {
    console.warn("Don't forget to add your Tutum credentials at /settings");
  } else {
    var url = 'wss://stream.tutum.co/v1/events?user='+username+'&token='+token;
    var socket = new WebSocket(url);

    socket.on('open', function() {
      console.log('Tutum events websocket opened');
    });

    socket.on('message', Meteor.bindEnvironment(function(messageStr) {
      var msg = JSON.parse(messageStr);
      // console.log(msg);
      console.log("\n******************************************");
      console.log("Type: " + msg.type);
      console.log("Action: " + msg.action);
      console.log("State: " + msg.state);
      console.log("Resource URI: " + msg.resource_uri);
      console.log("Date: " + moment(msg.date).format('LLL'));
      console.log("Event UUID: " + msg.uuid);
      console.log("******************************************");

      if (msg.type == "stack") {
        if (Stacks.findOne({ uri: msg.resource_uri })) {
          Stacks.update({ uri: msg.resource_uri }, { $set: { state: msg.state } });
        }
      }
    }));

    socket.on('close', function() {
      console.log('Tutum events websocket closed');
    });
  }

});
