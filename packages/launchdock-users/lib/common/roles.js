/**
 * Roles
 * @namespace Users.is
 */
Users.is = {};


/**
 * Check if a user is an admin
 * @param {Object|String} userOrUserId - The user or their userId
 */
Users.is.admin = function (userOrUserId) {
  try {
    var user = Users.getUser(userOrUserId);
    return !!user && Roles.userIsInRole(user, ['admin']);
  } catch (e) {
    return false; // user not logged in
  }
};


/**
 * Check if a user owns a document
 * @param {Object|String} userOrUserId - The user or their userId
 * @param {Object} doc - The document to check
 */
Users.is.owner = function (userOrUserId, doc) {
  try {
    var user = Users.getUser(userOrUserId);
    if (!!doc.userId) {
      // case 1: use document.userId to check
      return user._id === doc.userId;
    } else {
      // case 2: document is a user, use _id to check
      return user._id === doc._id;
    }
  } catch (e) {
    return false; // user not logged in
  }
};


/**
 * Collection helpers
 * https://atmospherejs.com/dburles/collection-helpers
 */
Users.helpers({
  isAdmin: function() {
    return Users.is.admin(this);
  }
});
