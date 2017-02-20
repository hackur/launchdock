import { Roles } from 'meteor/alanning:roles';
import { Apps } from '/lib/collections';
import { Logger } from '/server/api';

export default function (root, { _id }, context) {
  if (!Roles.userIsInRole(context.userId, 'admin')) {
    const msg = 'Insufficient permissions';
    Logger.error(msg);
    throw new Error(msg);
  }

  return Apps.findOne({ _id });
}
