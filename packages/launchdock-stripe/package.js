Package.describe({
  name: 'launchdock:stripe',
  summary: 'Internal Launchdock package for Stripe usage.'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.1']);

  api.use([
    'launchdock:core',
    'launchdock:lib'
  ]);

  api.addFiles([
    'lib/common.js'
  ], ['client', 'server']);

  api.addFiles([
    'lib/server/main.js',
    'lib/server/publications.js',
    'lib/server/methods.js'
  ], 'server');

});
