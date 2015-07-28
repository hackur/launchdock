
Template.registerHelper('getSetting', function(setting, defaultValue){
  setting = Settings.get(setting, defaultValue);
  return setting;
});
