
// allow admins to manipulate jobs
Launchdock.Jobs.allow({
  admin(userId, method, params) {
    return Users.is.admin(userId);
  }
});
