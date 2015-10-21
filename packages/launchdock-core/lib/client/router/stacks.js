
Launchdock.routes.private.route('/stacks', {
  name: 'stacks_list',
  action() {
    BlazeLayout.render("dashboard_layout", { content: "stacks_list" });
  }
});

Launchdock.routes.private.route('/stacks/new', {
  name: 'stack_new',
  action() {
    BlazeLayout.render("dashboard_layout", { content: "stack_new" });
  }
});

Launchdock.routes.private.route('/stacks/:_id', {
  name: 'stack_page',
  action() {
    BlazeLayout.render("dashboard_layout", { content: "stack_page" });
  }
});

Launchdock.routes.private.route('/stacks/:_id/ssl', {
  name: 'stack_ssl',
  action() {
    BlazeLayout.render("dashboard_layout", { content: "stack_ssl" });
  }
});
