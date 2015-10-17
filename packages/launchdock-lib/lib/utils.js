
/**
 *  Launchdock Utils
 */
Launchdock.utils = {};


/**
 * Slugify a string
 * @param {String} str - a string to be converted to a url-friendly slug
 * @return {String} slugified string
 */
Launchdock.utils.slugify = function (str) {
  // underscorestring:underscore.string
  return s.slugify(str);
}
