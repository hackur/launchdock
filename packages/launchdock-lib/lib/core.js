/**
 * Kick off the global namespace for Launchdock.
 * @namespace Launchdock
 */
Launchdock = {};

Launchdock.VERSION = '0.1.0';


/**
 * Check if we're running in production
 * @return {Boolean} true if NODE_ENV is 'production'
 */
Launchdock.isProduction = function () {
  return (process.env.NODE_ENV === 'production');
}


/**
 * Global configs
 */
Launchdock.config = {}
