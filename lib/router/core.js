
FlowRouter.route('/', {
  name: 'dashboard',
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "dashboard" });
  }
});

FlowRouter.route('/logout', {
  name: 'logout',
  action: function() {
    Meteor.logout(function () {
      FlowRouter.redirect('/login');
    });
  }
});
