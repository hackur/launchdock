import slugify from 'underscore.string/slugify';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Roles } from 'meteor/alanning:roles';
import { Invitations, Stacks, Users } from '/lib/collections';
import { Launchdock, Logger, initAnalytics } from '/server/api';

// const analytics = initAnalytics();

export default function () {

  Meteor.methods({

    createReactionAccount(doc) {

      const logger = Logger.child({
        meteor_method: 'createReactionAccount',
        meteor_method_args: doc
      });

      if (!Launchdock.api.authCheck(doc.token, this.userId)) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(doc, {
        token: String,
        shopName: String,
        email: String,
        password: String
      });

      if (!!Accounts.findUserByEmail(doc.email)) {
        const err = 'Email already registered.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const shopNameSlug = slugify(doc.shopName);

      const launchdockUsername = Random.id();
      const launchdockAuth = Random.secret();

      const launchdockUserId = Accounts.createUser({
        username: launchdockUsername,
        password: launchdockAuth,
        email: doc.email,
        profile: {
          shopName: doc.shopName
        },
        'subscription.status': 'trial'
      });

      logger.info('New Reaction user created.');

      Roles.setUserRoles(launchdockUserId, ['customer']);

      logger.debug(`User ${launchdockUserId} role updated to customer`);

      const stackCreateDetails = {
        name: shopNameSlug,
        appEnvVars: {
          REACTION_SHOP_NAME: doc.shopName,
          REACTION_EMAIL: doc.email,
          REACTION_AUTH: doc.password,
          METEOR_USER: doc.email,
          LAUNCHDOCK_USERID: launchdockUserId,
          LAUNCHDOCK_USERNAME: launchdockUsername,
          LAUNCHDOCK_AUTH: launchdockAuth,
          LAUNCHDOCK_URL: Meteor.absoluteUrl(),
          MAIL_URL: process.env.MAIL_URL,
          NODE: 'node'
        },
        token: doc.token
      };

      Meteor.call('rancher/createTrial', stackCreateDetails, launchdockUserId);

      analytics.identify({
        userId: launchdockUserId,
        traits: {
          email: doc.email,
          username: launchdockUsername,
          shop_name: doc.shopName,
          plan: 'trial'
        }
      });

      analytics.track({
        userId: launchdockUserId,
        event: 'New Reaction shop launched',
        properties: {
          shop_name: doc.shopName,
          plan: 'trial'
        }
      });

      return launchdockUserId;
    },


    sendReactionInvite(options) {

      const logger = Logger.child({
        meteor_method: 'sendReactionInvite',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        email: String,
        role: String,
        intercomId: Match.Optional(String)
      });

      this.unblock();

      if (!!Invitations.findOne({ email: options.email })) {
        const err = 'Email has already been invited';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      options.token = Random.hexString(32);
      options.invitedBy = this.userId;

      const url = process.env.REACTION_DRIVE_URL + 'invite/' + options.token;
      const emailHtml = 'email/templates/reaction-invitation.html';

      SSR.compileTemplate('invitation', Assets.getText(emailHtml));
      const content = SSR.render('invitation', { url: url });

      const emailOpts = {
        to: options.email,
        from: 'Reaction Commerce <invites@reactioncommerce.com>',
        subject: 'You\'re invited to Reaction Commerce!',
        html: content
      };

      Meteor.defer(() => {
        Email.send(emailOpts);
      });

      Invitations.insert(options);

      const msg = `${options.email} has been invited to Reaction.`;
      Meteor.call('util/slackMessage', msg);

      logger.info(`Invite successfully sent to ${options.email}`);

      let intercomUpdate = {
        email: options.email,
        updates: {
          invited: true,
          invite_accepted: false
        }
      };

      if (options.intercomId) {
        intercomUpdate.id = options.intercomId;
      }

      Meteor.call('intercom/updateUser', intercomUpdate, (err) => {
        if (!err) {
          logger.info(`Updated user details on Intercom for user ${options.email}`);
        }
      });

      return true;
    },


    activateInvitation(options) {

      const logger = Logger.child({
        meteor_method: 'activateInvitation',
        meteor_method_args: options
      });

      if (!Launchdock.api.authCheck(options.token, this.userId)) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        token: String, // api token
        email: String,
        password: String,
        shopName: String,
        inviteToken: String
      });

      const invite = Invitations.findOne({ token: options.inviteToken });

      if (!invite) {
        const err = 'Invitation not found.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // invite can only be used once
      if (invite.accepted) {
        const err = 'Invitation has already been used.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      // drop the unneeded token
      delete options.inviteToken;

      // create a user account and launch a shop
      let userId;
      try {
        logger.info(`Creating new user and shop: ${options.shopName}`);
        userId = Meteor.call('createReactionAccount', options);
      } catch (err) {
        Logger.error(err);
        return err;
      }

      Invitations.update({ _id: invite._id }, {
        $set: {
          accepted: true,
          acceptedDate: new Date(),
          userId: userId
        }
      }, (err) => {
        if (!err) {
          logger.info(`Invitation successfully accepted by ${invite.email}`);
        }
      });

      const msg = `${invite.email} has accepted their invite to Reaction!`;
      Meteor.call('util/slackMessage', msg);

      Meteor.call('intercom/updateUser', {
        user_id: userId,
        email: options.email,
        updates: {
          shop_name: options.shopName,
          plan: 'trial',
          invite_accepted: true
        }
      });

      return true;
    },


    'reaction/bulkInvite'(amount) {

      const logger = Logger.child({
        meteor_method: 'reaction/bulkInvite',
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Must be admin.';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(amount, Match.Optional(Number));

      const total = amount || 10;

      let page = 0;
      let users = [];

      // keep grabbing more users from intercom until we have the amount
      for (; users.length < total;) {
        // get the next page each time around
        const options = {
          page: page++
        };

        // gets 50 users per call
        const pageOfUsers = Meteor.call('intercom/getUsers', options);

        // make sure they have an email and haven't already been invited
        pageOfUsers.forEach((user) => {
          if (!user.email || user.custom_attributes.invited) {
            return;
          }
          if (user.custom_attributes.listId === 'c61cb7dc2e') {
            users.push(user);
          }
        });
      }

      // if we went over, remove the last entries until
      // it exactly matches the specified amount
      if (users.length > total) {
        users.splice(total);
      }

      users.forEach((user) => {
        Meteor.call('sendReactionInvite', {
          intercomId: user.id,
          email: user.email,
          role: 'customer'
        }, (err) => {
          if (!err) {
            logger.info(`Successfully invited ${user.email}`);
          }
        });
      });

      logger.info(`Successfully invited ${users.length} users`);

      return true;
    }
  });
}
