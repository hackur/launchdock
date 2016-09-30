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
 * @param {Object|String} userOrUserId - user object or userId
 * @return {Boolean} - returns true if valid API token or admin user
 */
Launchdock.api.authCheck = (token, userOrUserId) => {
  return (token === process.env.LAUNCHDOCK_API_TOKEN || Roles.userIsInRole(userOrUserId, 'admin'));
};

export default Launchdock;
