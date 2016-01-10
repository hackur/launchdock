Template.stack_page.onCreated(function() {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});


Template.stack_page.helpers({
  stackServices() {
    return Services.find({}, { sort: { name: 1 }});
  },
  type() {
    return this.tags[0].name;
  }
});
