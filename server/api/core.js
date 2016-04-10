import { Roles } from 'meteor/alanning:roles';

const Launchdock = {};

/**
 * Check if we're running in production
 * @return {Boolean} true if NODE_ENV is 'production'
 */
Launchdock.isProduction = () => {
  return (process.env.NODE_ENV === 'production');
};


/**
 * Launchdock API namespace
 * @namespace Launchdock.api
 */
Launchdock.api = {};

/**
 * Check for valid API token or if current user is an admin
 * @param {String} token - api token for remote method calls
 * @param {Object|String} userOrUserId
 * @return {Boolean}
 */
Launchdock.api.authCheck = (token, userId) => {
  return (token === process.env.LAUNCHDOCK_API_TOKEN || Roles.userIsInRole(userId, 'admin'));
};

export default Launchdock;
