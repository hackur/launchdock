Package.describe({
  name: 'launchdock:tutum',
  summary: 'Tutum integration for Launchdock.'
});

Npm.depends({
  'ws': '0.8.0'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.1']);

  api.use([
    'launchdock:core',
    'launchdock:lib',
    'launchdock:settings'
  ]);

  api.addFiles([
    'lib/server/main.js',
    'lib/server/tutum.js',
    'lib/server/socket.js',
    'lib/server/methods/stacks.js'
  ], ['server']);

});
