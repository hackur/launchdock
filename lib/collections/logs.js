import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Logs = new Mongo.Collection('logs');

// No schema yet. Still trying to work out what that should look like

/**
 * Deny client side operations by default
 */
Logs.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Logs;
