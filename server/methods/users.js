import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Invitations, Settings, Users } from '/lib/collections';
import { Email, Logger, Slack } from '/server/api';

export default function () {

  Meteor.methods({

    'changeUserEmail'(options) {

      const logger = Logger.child({
        meteor_method: 'changeUserEmail',
        meteor_method_args: options,
        userId: this.userId
      });

      check(options, {
        userId: String,
        email: String
      });

      const isAdmin = Roles.userIsInRole(this.userId, 'superuser');

      if (options.userId !== this.userId && !isAdmin) {
        const err = 'AUTH ERROR: Action not allowed';
        logger.error(err);
        throw new Meteor.Error('action-not-allowed', err);
      }

      const id = options.userId || this.userId;

      const user = Users.findOne(id);

      if (!user) {
        const err = 'User not found';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const oldEmail = user.emails[0].address;

      if (options.email.toLowerCase() === oldEmail.toLowerCase()) {
        logger.info('Same email. Not updating.');
        return true;
      }

      Accounts.addEmail(id, options.email);

      Accounts.removeEmail(id, oldEmail);

      logger.info(`Email succesfully updated to ${options.email} for user ${id}`);

      return true;
    },

    /**
     * Add roles to users. Does NOT overwrite
     * the user's existing roles.
     */
    'addUsersToRoles'(options) {

      const logger = Logger.child({
        meteor_method: 'addUsersToRoles',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        users: Match.OneOf(String, [String]),
        roles: Match.OneOf(String, [String])
      });

      try {
        Roles.addUsersToRoles(options.users, options.roles);
      } catch (err) {
        logger.error(err);
        throw new Meteor.Error(err);
      }

      if(Array.isArray(options.users)) {
        _.each(options.users, (user) => {
          logger.info(`Added user ${user} to role(s) ${options.roles}`);
        });
      } else {
        logger.info(`Added user ${options.users} to role(s) ${options.roles}`);
      }

      return true;
    },


    /**
     * Set roles for users. This DOES overwrite
     * any of the user's existing roles.
     */
    'setUserRoles'(options) {

      const logger = Logger.child({
        meteor_method: 'setUserRoles',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        users: Match.OneOf(String, [String]),
        roles: Match.OneOf(String, [String])
      });

      try {
        Roles.setUserRoles(options.users, options.roles);
      } catch (err) {
        logger.error(err);
        throw new Meteor.Error(err);
      }

      if(Array.isArray(options.users)) {
        _.each(options.users, (user) => {
          logger.info(`Set user ${user} to role(s) ${options.roles}`);
        });
      } else {
        logger.info(`Set user ${options.users} to role(s) ${options.roles}`);
      }

      return true;
    },


    sendUserInvite(options) {

      const logger = Logger.child({
        meteor_method: 'sendUserInvite',
        meteor_method_args: options,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(options, {
        email: String,
        role: String,
        api: Match.Optional(Boolean),
        appName: Match.Optional(String)
      });

      this.unblock();

      if (!!Invitations.findOne({ email: options.email })) {
        const err = 'Email has already been invited';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const { email, role, api, appName } = options;
      const token = Random.hexString(32);

      const invitation = {
        email,
        role,
        token,
        invitedBy: this.userId
      };

      Invitations.insert(invitation);

      const emailHtml = `email/templates/${api ? 'api' : 'admin'}-invitation.html`;
      const url = Meteor.absoluteUrl() + 'invite/' + token;
      const emailData = api ? { token } : { url };

      SSR.compileTemplate('user-invite', Assets.getText(emailHtml));
      const content = SSR.render('user-invite', emailData);

      const siteTitle = appName || Settings.get('app.title', 'Launchdock');
      const adminEmail = Settings.get('app.adminEmail', 'no-reply@launchdock.io');

      const emailOpts = {
        to: email,
        from: `${siteTitle} <${adminEmail}>`,
        subject: `You're invited to ${siteTitle}!`,
        html: content
      };

      Email.send(emailOpts);

      Slack.message(`${email} has been invited to be an admin.`);

      logger.info(`New user invited: ${email}`);

      return true;
    },


    activateUserInvite(options) {

      check(options, {
        username: String,
        email: String,
        password: String,
        inviteToken: String
      });

      const logger = Logger.child({
        meteor_method: 'activateUserInvite',
        meteor_method_args: options,
        userId: this.userId
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

      if (Accounts.findUserByUsername(options.username)) {
        const msg = 'Username already exists';
        logger.warn(msg);
        throw new Meteor.Error(msg);
      }

      const userId = Accounts.createUser({
        username: options.username,
        email: invite.email,
        password: options.password
      });

      Roles.setUserRoles(userId, [invite.role]);

      logger.info(`New user created with email ${options.email} and role ${invite.role}`);

      Invitations.update({ _id: invite._id }, {
        $set: {
          accepted: true,
          acceptedDate: new Date(),
          userId: userId
        }
      }, (err, res) => {
        if (!err) {
          logger.info(`Invitation successfully accepted by ${invite.email}`);
        }
      });

      Slack.message(`Invitation successfully accepted by ${invite.email}`);

      return true;
    },


    revokeInvitation(inviteId) {

      const logger = Logger.child({
        meteor_method: 'revokeInvitation',
        meteor_method_args: inviteId,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(inviteId, String);

      try {
        Invitations.remove(inviteId);
      } catch (err) {
        logger.error(err);
        throw new Meteor.Error(err);
      }

      logger.info(`Successfully removed invitation: ${inviteId}`);

      return true;
    },


    deleteInvitedUser(userId) {

      const logger = Logger.child({
        meteor_method: 'deleteInvitedUser',
        meteor_method_args: userId,
        userId: this.userId
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Invalid credentials';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      check(userId, String);

      this.unblock();

      Invitations.remove({ userId: userId });
      Users.remove(userId);

      logger.info(`User ${userId} succesfully deleted.`);

      return true;
    }

  });

}
