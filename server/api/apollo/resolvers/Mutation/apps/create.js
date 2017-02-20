import { Roles } from 'meteor/alanning:roles';
import { Apps } from '/lib/collections';
import { Logger } from '/server/api';


// Accept an invite and create an account
//
// Usage:
//
// mutation createApp($name: String!, $image: String ) {
//   createApp(name: $name, image: $image) {
//     id
//   }
// }
export default function createApp(_, { name, image }, context) {

  const logger = Logger.child({
    resolver: 'createApp',
    args: [{ name, image }],
    userId: context.userId
  });

  if (!Roles.userIsInRole(context.userId, 'admin')) {
    const msg = 'Insufficient permissions';
    logger.error(msg);
    throw new Error(msg);
  }

  if (!!Apps.findOne({ name })) {
    const msg = 'App name already exists';
    logger.error(msg);
    throw new Error(msg);
  }

  const appId = Apps.insert({ name, image });

  logger.info(`App ${name} created`);

  return Apps.findOne(appId);
}
