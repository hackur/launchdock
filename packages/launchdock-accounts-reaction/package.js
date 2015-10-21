Package.describe({
  name: 'launchdock:accounts-reaction',
  summary: 'Reaction accounts integration.'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'launchdock:lib',
    'launchdock:tutum',
    'launchdock:users'
  ]);

  api.addFiles([
    'lib/server/main.js',
    'lib/server/methods.js'
  ], ['server']);

  api.addAssets([
    'lib/server/email/invitation.html'
  ], 'server');

});
