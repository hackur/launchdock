/**
 * Roles
 * @namespace Users.is
 */
Users.is = {};


/**
 * Check if a user is an admin
 * @param {Object|String} userOrUserId - The user or their userId
 * @return {Boolean} returns true if user is an admin, false otherwise
 */
Users.is.admin = (userOrUserId) => {
  try {
    const user = Users.getUser(userOrUserId);
    return !!user && Roles.userIsInRole(user, ["admin"]);
  } catch (e) {
    return false; // user not logged in
  }
};


/**
 * Check if a user owns a document
 * @param {Object|String} userOrUserId - The user or their userId
 * @param {Object} doc - The document to check
 * @return {Boolean} returns true if user owns a document, false otherwise
 */
Users.is.owner = (userOrUserId, doc) => {
  try {
    const user = Users.getUser(userOrUserId);
    if (!!doc.userId) {
      // case 1: use document.userId to check
      return user._id === doc.userId;
    }
    // case 2: document is a user, use _id to check
    return user._id === doc._id;
  } catch (e) {
    return false; // user not logged in
  }
};


/**
 * Collection helpers
 * https://atmospherejs.com/dburles/collection-helpers
 */
Users.helpers({
  isAdmin() {
    return Users.is.admin(this);
  }
});
