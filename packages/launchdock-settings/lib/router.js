
FlowRouter.route('/settings', {
  name: 'settings',
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "settings" });
  }
});

