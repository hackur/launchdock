
// 404 route
FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "not_found" });
  }
};


// force sign-in for all routes
FlowRouter.triggers.enter([AccountsTemplates.ensureSignedIn]);
