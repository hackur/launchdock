
Template.stack_info.onCreated(function() {
  var self = this;
  self.autorun(function() {
    var stackId = FlowRouter.getParam('_id');
    self.subscribe('stack-page', stackId);
  });
});


Template.stack_info.helpers({
  stack: function () {
    return Stacks.find();
  },
  stackUrlReady: function () {
    // TODO: do some health checks to make sure app is actually ready to view
    var stack = Stacks.findOne();
    return (stack.services.length === 4 && stack.state === 'Running');
  }
});
