
/**
 * Launchdock API namespace
 * @namespace Launchdock.api
 */
Launchdock.api = {};

/**
 * Check for valid API token or if current user is an admin
 * @param {String} token
 * @param {Object|String} userOrUserId
 * @return {Boolean}
 */
Launchdock.api.authCheck = function(token, userOrUserId) {
  return (token === process.env.LAUNCHDOCK_API_TOKEN || Users.is.admin(userOrUserId));
}
