import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { Invitations, Users } from '/lib/collections';
import { Logger, Slack } from '/server/api';


// Accept an invite and create an account
//
// Usage:
//
// mutation acceptInvite($username: String!, $password: String!, $token: String!) {
//   acceptInvite(username: $username, password: $password, token: $token) {
//     _id
//     email
//   }
// }
export default function acceptInvite(_, { username, password, token }) {

  const logger = Logger.child({
    resolver: 'acceptInvite',
    args: [{ username, password, token }]
  });

  const invite = Invitations.findOne({ token });

  if (!invite) {
    const err = 'Invitation not found.';
    logger.error(err);
    throw new Error(err);
  }

  if (invite.accepted) {
    const err = 'Invitation has already been used.';
    logger.error(err);
    throw new Error(err);
  }

  if (Accounts.findUserByUsername(username)) {
    const msg = 'Username already exists';
    logger.error(msg);
    throw new Error(msg);
  }

  const userId = Accounts.createUser({
    username,
    password,
    email: invite.email
  });

  Roles.setUserRoles(userId, [invite.role]);

  logger.info(`New user created with email ${invite.email} and role ${invite.role}`);

  Invitations.update({ _id: invite._id }, {
    $set: {
      accepted: true,
      acceptedDate: new Date(),
      userId
    }
  }, (err) => {
    if (!err) {
      const msg = `Invitation successfully accepted by ${invite.email}`;
      logger.info(msg);
      Slack.message(msg);
    }
  });

  return Users.findOne(userId);
}
