
Launchdock.routes.private.route("/settings", {
  name: "settings",
  action() {
    BlazeLayout.render("dashboard_layout", { content: "settings" });
  }
});
