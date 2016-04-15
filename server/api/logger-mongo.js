import { Mongo } from 'meteor/mongo';
import { Logs } from '/lib/collections';


/**
 * Insert Bunyan logs into the Logs collection
 */
export default class BunyanMongo {}


BunyanMongo.prototype.write = Meteor.bindEnvironment((log) => {
  Logs.insert(log);
});
