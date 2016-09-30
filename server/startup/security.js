import _ from 'lodash';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

export default function () {

  // Get a list of all methods by running
  // `Meteor.server.method_handlers` in meteor shell.
  // Or use Object.keys(Meteor.server.method_handlers)
  const AUTH_METHODS = [
    'login',
    'logout',
    'logoutOtherClients',
    'getNewToken',
    'removeOtherTokens',
    'configureLoginService',
    'changePassword',
    'forgotPassword',
    'resetPassword',
    'verifyEmail',
    'createUser',
    'ATRemoveService',
    'ATCreateUserServer',
    'ATResendVerificationEmail'
  ];

  // Only allow 2 login attempts per connection per 5 seconds
  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(AUTH_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 2, 5000);

}
