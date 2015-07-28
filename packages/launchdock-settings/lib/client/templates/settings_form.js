
Template.settings.onCreated(function () {
  this.subscribe('settings');
});

Template.settings.helpers({
  settings: function () {
    return Settings.findOne();
  }
});

AutoForm.hooks({
  updateSettingsForm: {
    onSuccess: function(formType, result) {
      Notify.success('Settings saved successfully!');
    },
    onError: function(formType, result) {
      Notify.error('Oh no! ' + result);
    }
  }
});
