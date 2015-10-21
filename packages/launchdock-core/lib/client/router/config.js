
/**
 * Config
 */

// 404 route
FlowRouter.notFound = {
  action() {
    BlazeLayout.render("dashboard_layout", { content: "not_found" });
  }
};
