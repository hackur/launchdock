/**
 *  sAlerts defaults
 */
Meteor.startup(function() {
  sAlert.config({
    effect: "jelly",
    position: "bottom-right",
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
      effect: "stackslide",
      position: location || "top"
    });
  },

  info(text, location) {
    sAlert.info(text, {
      position: location || "bottom-right"
    });
  },

  warn(text, location) {
    sAlert.warning(text, {
      position: location || "top-right",
      timeout: 7000
    });
  },

  error(text, location) {
    sAlert.error(text, {
      position: location || "top",
      timeout: 7000
    });
  }
};


// better namespace for kevohagan:sweetalert
Alert = {
  success(title, text) {
    swal(title, text, "success");
  },

  info(title, text) {
    swal(title, text);
  },

  confirm(options, callback) {
    swal({
      title: options.title || "Are you sure?",
      text: options.text || "",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: options.confirmButtonText || "Do it!",
      closeOnConfirm: false
    }, () => {
      swal({
        title: "Success!",
        text: options.successMsg || "",
        type: "success",
        timer: 1500,
        showConfirmButton: false
      });
      if (_.isFunction(callback)) {
        callback()
      }
    });
  },

  error(options) {
    swal(options.title || "Oops!", options.text || "Something went wrong.", "error");
  }
};
