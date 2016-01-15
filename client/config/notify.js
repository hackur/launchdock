
/**
 *  sAlerts defaults
 */
Meteor.startup(function() {
  sAlert.config({
    effect: 'jelly',
    position: 'bottom-right',
    timeout: 3000,
    html: false,
    onRouteClose: false,
    stack: true,
    offset: 0
  });
});


// wrapper for simpler calls
Notify = {
  success(text, location) {
    sAlert.info(text, {
      effect: 'stackslide',
      position: location || 'top'
    });
  },

  info(text, location) {
    sAlert.info(text, {
      position: location || 'bottom-right'
    });
  },

  warn(text, location) {
    sAlert.warning(text, {
      position: location || 'top-right',
      timeout: 7000
    });
  },

  error(text, location) {
    sAlert.error(text, {
      position: location || 'top',
      timeout: 7000
    });
  }
}
