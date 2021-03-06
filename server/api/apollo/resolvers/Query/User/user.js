import { Users } from '/lib/collections';
import { Logger } from '/server/api';

export default function (root, { _id }, context) {
  if (!Roles.userIsInRole(context.userId, 'admin')) {
    const msg = 'Insufficient permissions';
    Logger.error(msg);
    throw new Error(msg);
  }

  return Users.findOne(_id);
}
