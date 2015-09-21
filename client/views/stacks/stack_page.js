Template.stack_page.onCreated(function() {
  var self = this;
  self.autorun(function() {
    var stackId = FlowRouter.getParam('_id');
    self.subscribe('stack-page', stackId);
  });
});


Template.stack_page.helpers({
  stackServices: function () {
    return Services.find({}, { sort: { name: 1 }});
  },
  role: function () {
    return this.tags[0].name;
  }
});
