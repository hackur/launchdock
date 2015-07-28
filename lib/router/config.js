Router.configure({
  layoutTemplate: 'dashboard_layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'not_found'
});

Router.setTemplateNameConverter(function (str) { return str; });

Router.plugin('ensureSignedIn');
