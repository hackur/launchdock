import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { Users } from '/lib/collections';
import { Logger, Slack } from '/server/api';

export default function () {
  Meteor.methods({
    'api/addKey'(options) {

      const logger = Logger.child({
        meteor_method: 'api/addKey',
        meteor_method_args: [options],
        userId: this.userId
      });

      check(options, {
        name: String,
        username: String,
        secret: String
      });

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Action not allowed!';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      if (!!Users.findOne({ name: options.name })) {
        const err = 'Name already exists';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      const apiKeyId = Accounts.createUser({
        username: options.username,
        password: options.secret
      });

      Users.update({ _id: apiKeyId }, {
        $set: {
          name: options.name,
          createdBy: this.userId
        }
      });

      Roles.setUserRoles(apiKeyId, 'api');

      const user = Users.findOne(this.userId);

      Slack.message(`New API key created by ${user.username} for '${options.name}'`);

      logger.info('API user succesfully created');

      return apiKeyId;
    },

    'api/deleteKey'(apiKeyId) {

      const logger = Logger.child({
        meteor_method: 'api/deleteKey',
        meteor_method_args: [apiKeyId],
        userId: this.userId
      });

      check(apiKeyId, String);

      if (!Roles.userIsInRole(this.userId, 'admin')) {
        const err = 'AUTH ERROR: Action not allowed!';
        logger.error(err);
        throw new Meteor.Error(err);
      }

      Users.remove({ _id: apiKeyId });

      logger.info('API user succesfully deleted');

      return true;
    }
  });
}
