Package.describe({
  name: 'launchdock:users',
  summary: 'Launchdock users.'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.1.0.2']);

  api.use([
    'launchdock:lib'
  ]);

  api.addFiles([
    'lib/namespace.js',
    'lib/roles.js'
  ], ['client', 'server']);

  api.addFiles([
    'lib/server/create_user.js'
  ], ['server']);

  api.export('Users');

});
