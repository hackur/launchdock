/**
 * Global routes namespace
 * @namespace {Object}
 */
Launchdock.routes = {};


/**
 * Public routes group
 */

Launchdock.routes.public = FlowRouter.group({
  name: "public"
});


/**
 * Private routes group
 */

const mustBeLoggedIn = () => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    FlowRouter.go("login");
  }
};

Launchdock.routes.private = FlowRouter.group({
  name: "private",
  triggersEnter: [mustBeLoggedIn]
});


Launchdock.routes.private.route("/", {
  name: "dashboard",
  action() {
    BlazeLayout.render("dashboard_layout", { content: "dashboard" });
  }
});

Launchdock.routes.private.route("/logout", {
  name: "logout",
  action() {
    Meteor.logout(() => {
      FlowRouter.redirect("/login");
    });
  }
});
