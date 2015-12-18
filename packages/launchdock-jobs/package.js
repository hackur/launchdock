Package.describe({
  name: 'launchdock:jobs',
  summary: 'Launchdock jobs package'
});

Package.onUse(function(api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  api.use([
    'ecmascript',
    'launchdock:core',
    'launchdock:lib',
    'launchdock:users',
    'vsivsi:job-collection'
  ]);

  api.addFiles([
    'lib/server/main.js',
    'lib/server/permissions.js',
    'lib/server/publications.js'
  ], 'server');

});
