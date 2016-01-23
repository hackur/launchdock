
// Global subscriptions
FlowRouter.subscriptions = function() {
  this.register("public-settings", Meteor.subscribe("public-settings"));
};
