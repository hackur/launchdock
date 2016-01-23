Package.describe({
  name: 'launchdock:core',
  summary: 'Launchdock core.',
  version: '0.1.0'
});

Package.onUse(function(api) {

  api.versionsFrom(['METEOR@1.2.1']);

  api.use([
    'launchdock:lib'
  ]);

  api.addFiles([
    'lib/client/router/config.js',
    'lib/client/router/core.js',
    'lib/client/router/subscriptions.js',
    'lib/client/router/settings.js',
    'lib/client/router/stacks.js'
  ], 'client');

});
