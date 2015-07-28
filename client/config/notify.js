
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
  success: function(text, location) {
    sAlert.info(text, {
      effect: 'stackslide',
      position: location || 'top'
    });
  },

  info: function(text, location) {
    sAlert.info(text, {
      position: location || 'bottom-right'
    });
  },

  warning: function(text, location) {
    sAlert.warning(text, {
      position: location || 'top-right',
      timeout: 7000
    });
  },

  error: function(text, location) {
    sAlert.error(text, {
      position: location || 'top',
      timeout: 7000
    });
  }
}
