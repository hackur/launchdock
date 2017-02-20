import { Roles } from 'meteor/alanning:roles';
import { Apps } from '/lib/collections';
import { Logger } from '/server/api';


// Accept an invite and create an account
//
// Usage:
//
// mutation deleteApp($name: ID!) {
//   deleteApp(name: $name) {
//     success
//   }
// }
export default function deleteApp(_, { name }, context) {

  const logger = Logger.child({
    resolver: 'deleteApp',
    args: [{ name }],
    userId: context.userId
  });

  if (!Roles.userIsInRole(context.userId, 'admin')) {
    const msg = 'Insufficient permissions';
    logger.error(msg);
    throw new Error(msg);
  }

  if (!Apps.findOne({ name })) {
    const msg = 'App not found';
    logger.error(msg);
    throw new Error(msg);
  }

  Apps.remove({ name });

  logger.info('App successfully deleted');

  return { success: true };
}
