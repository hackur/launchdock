
FlowRouter.route('/stacks', {
  name: 'stacks_list',
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "stacks_list" });
  }
});

FlowRouter.route('/stacks/new', {
  name: 'stack_new',
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "stack_new" });
  }
});

FlowRouter.route('/stacks/:_id', {
  name: 'stack_page',
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "stack_page" });
  }
});
