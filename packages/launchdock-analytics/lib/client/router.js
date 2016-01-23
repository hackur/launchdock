
// track each page view
FlowRouter.triggers.enter([
  (context) => {
    window.analytics.page(context.route.name);
  }
]);
