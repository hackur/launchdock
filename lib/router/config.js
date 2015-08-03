
// 404 route
FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render("dashboard_layout", { content: "not_found" });
  }
};

// FlowRouter.triggers.enter([AccountsTemplates.ensureSignedIn]);
