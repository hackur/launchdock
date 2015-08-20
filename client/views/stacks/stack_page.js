Template.stack_page.onCreated(function() {
  var self = this;
  self.autorun(function() {
    var stackId = FlowRouter.getParam('_id');
    self.subscribe('stack-page', stackId);
  });
});

Template.stack_page.helpers({
  stack: function () {
    return Stacks.find();
  },
  stackServices: function () {
    return Services.find();
  },
  role: function () {
    return this.tags[0].name;
  },
  stateClass: function () {
    switch (this.state) {
      case 'Running':
        return 'green'
        break;
      case 'Not running':
        return 'red'
        break;
      case 'Starting':
        return 'orange'
        break;
      case 'Redeploying':
        return 'orange'
        break;
      case 'Partly running':
        return 'orange'
        break;
      case 'Stopping':
        return 'red'
        break;
      case 'Stopped':
        return 'red'
        break;
      case 'Terminated':
        return 'muted'
        break;
    }
  }
});
