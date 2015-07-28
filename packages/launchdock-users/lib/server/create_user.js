
/**
 * First user is set to admin role and every other
 * user is assigned the "app-frontend" role by default.
 */
Users.after.insert(function(userId, doc) {
  if (Users.find().count() > 1) {
    Roles.addUsersToRoles(doc._id, 'app-frontend');
  }
});
