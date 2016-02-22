
// publish all jobs to admins
Meteor.publish("jobs", function() {
  if (Users.is.admin(this.userId)) {
    return Launchdock.Jobs.find();
  }
  return [];
});
