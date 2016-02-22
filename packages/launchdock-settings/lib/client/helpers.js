
Template.registerHelper("getSetting", (setting, defaultValue) => {
  return Settings.get(setting, defaultValue);
});
