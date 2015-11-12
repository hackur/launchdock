
Template.stack_info.onCreated(function() {
  this.autorun(() => {
    var stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_info.helpers({
  stack() {
    return Stacks.find();
  },
  stackUrlReady() {
    // TODO: do some health checks to make sure app is actually ready to view
    var stack = Stacks.findOne();
    return (stack.services.length === 4 && stack.state === 'Running');
  },
  isStackPage() {
    return (FlowRouter.getRouteName() === "stack_page");
  }
});
