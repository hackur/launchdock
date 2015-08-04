
// 404 route
FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "not_found" });
  }
};


// TODO: fix AccountsTemplates plugin for more better state handling
function mustBeLoggedIn() {
  var route = FlowRouter.getRouteName();
  if (! Meteor.user() && route !== 'signIn') {
    FlowRouter.redirect('/login');
    Notify.error('Please log in.')
  }
}
FlowRouter.triggers.enter([mustBeLoggedIn]);
