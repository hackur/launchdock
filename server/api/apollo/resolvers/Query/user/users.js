import { Roles } from 'meteor/alanning:roles';
import { Users } from '/lib/collections';
import { Logger } from '/server/api';

export default function (root, args, context) {
  if (!Roles.userIsInRole(context.userId, ['admin', 'manager'])) {
    const msg = 'Insufficient permissions';
    Logger.error(msg);
    throw new Error(msg);
  }

  // by default, only return customers (for managers)
  let roles = ['customer'];

  // but publish all users for admins
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    roles = ['customer', 'manager', 'admin'];
  }

  return Users.find({ roles: { $in: roles } }, {
    fields: {
      'emails.address': 1,
      roles: 1,
      username: 1
    }
  }).fetch();
}
