Package.describe({
  name: 'launchdock:email',
  summary: 'Launchdock email package.'
});

Package.onUse(function(api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use('launchdock:lib');

  api.addAssets([
    'server/templates/enrollment.html',
    'server/templates/verify_email.html',
    'server/templates/password_reset.html'
  ], 'server');

  api.addFiles([
    'server/main.js',
    'server/config.js'
  ], 'server');


});
