import WebSocket from 'ws';
import { Meteor } from 'meteor/meteor';
import { Hosts, Stacks, Services, Settings } from '/lib/collections';
import { Logger, Rancher } from '/server/api';

/**
 * Monitor Rancher events over websocket stream API
 */

// set an error iterator so we can prevent infinite reconnect
// loops when we have connection issues that need human intervention
let socketErrors = 0;

const startEventsStream = () => {
  const s = Settings.findOne();

  if (!s.rancherApiUrl || !s.rancherApiKey || !s.rancherApiSecret) {
    Logger.warn('Missing Rancher settings. Events websocket not opened.');
    return;
  }

  const rancher = new Rancher();

  // grab Rancher credentials
  const accessKey = rancher.apiKey;
  const secretKey = rancher.apiSecret;
  const env = rancher.env;

  // grab the hostname
  const host = rancher.hostname;

  // build the websocket URL
  const url = `wss://${accessKey}:${secretKey}@${host}/v1/projects/${env}/subscribe?eventNames=resource.change`;

  const socket = new WebSocket(url);

  socket.on('open', Meteor.bindEnvironment(() => {
    Logger.info('Rancher events websocket opened');
    Settings.set('rancher.connected', true);
    // reset the error limit if we successfully connect
    socketErrors = 0;
  }));

  socket.on('message', Meteor.bindEnvironment((messageStr) => {
    const msg = JSON.parse(messageStr);

    if (msg.name === 'resource.change' && msg.data) {

      const resource = msg.data.resource;

      // convert 'environent' to 'stack' until Rancher fixes that nonsense in the API
      const resourceType = resource.type === 'environment' ? 'stack' : resource.type;

      // const msgType = resource.transitioning === 'error' ? 'ERROR' : 'INFO';
      //
      // console.log('\n******************************************');
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
      // console.log('******************************************');

      // convert a few state strings to preferred names
      let state;
      switch (resource.state) {
        case 'activating':
          state = 'Starting';
          break;
        case 'active':
          state = 'Running';
          break;
        default:
          state = resource.state;
      }

      // If this message is for a host that exists in the database, update its state
      if (resourceType === 'machine' && !!Hosts.findOne({ rancherId: resource.id })) {
        Hosts.update({ rancherId: resource.id }, { $set: { state } });
      }

      // If this message is for a stack that exists in the database, update its state
      if (resourceType === 'stack' && !!Stacks.findOne({ rancherId: resource.id })) {
        Stacks.update({ rancherId: resource.id }, { $set: { state } });
      }

      // If this message is for a service that exists in the database, update its state
      if (resourceType === 'service' || resourceType === 'loadbalancerservices'
          && !!Services.findOne({ rancherId: resource.id })) {
        Services.update({ rancherId: resource.id }, { $set: { state } });
      }
    }
  }));

  socket.on('error', Meteor.bindEnvironment((err) => {
    Logger.error(err, 'Rancher events websocket error!');
  }));

  socket.on('close', Meteor.bindEnvironment(() => {
    Logger.warn('Rancher events websocket closed!');

    Settings.set('rancher.connected', false);

    socketErrors++;

    // reopen websocket if it closes and the error
    // limit hasn't been exceeded
    if (socketErrors < 10) {
      Meteor.setTimeout(() => {
        Logger.info('Attempting to reconnect to Rancher websocket...');
        startEventsStream();
      }, 10000);
    } else {
      Logger.error(`Failed to connect to Rancher websocket ${socketErrors} times. Stopping retries.`);
    }
  }));
};

export default function () {
  if (process.env.RANCHER_WEBSOCKET_ENABLED === 'true') {
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
          Logger.info('Rancher API credentials changed.');
          startEventsStream();
        }
      }
    });
  } else {
    Logger.debug('RANCHER_WEBSOCKET_ENABLED not set. Not connecting to Rancher.');
  }
}
