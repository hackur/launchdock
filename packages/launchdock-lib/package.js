Package.describe({
  name: 'launchdock:lib',
  summary: 'Launchdock lib package.'
});

Package.onUse(function(api) {

  api.versionsFrom(['METEOR@1.2.0.2']);

  Npm.depends({
    'bunyan-loggly': '0.0.5'
  });

  var packages = [
    'meteor-base',
    // 'standard-minifiers',
    'seba:minifiers-autoprefixer',
    'mobile-experience',
    'mongo',
    'blaze-html-templates',
    'session',
    'tracker',
    'logging',
    'reload',
    'random',
    'ejson',
    'spacebars',
    'check',
    'ecmascript',
    'accounts-base',
    'accounts-password',
    'email',
    'http',
    'jquery',
    'reactive-var',
    'reactive-dict',
    'templating',
    'underscorestring:underscore.string',
    'kadira:flow-router',
    'kadira:blaze-layout',
    'arillo:flow-router-helpers',
    'zimme:active-route',
    'ongoworks:security',
    'ongoworks:bunyan-logger',
    'meteorhacks:ssr',
    'aldeed:simple-schema',
    'aldeed:autoform',
    'aldeed:collection2',
    'aldeed:template-extension',
    'matb33:collection-hooks',
    'gildaspk:autoform-materialize',
    'alanning:roles',
    'aslagle:reactive-table',
    'fourseven:scss',
    'poetic:materialize-scss',
    'useraccounts:core',
    'useraccounts:materialize',
    'mizzao:user-status',
    'sacha:spin',
    'momentjs:moment',
    'jeremy:reactive-stripe'
  ];

  api.use(packages);
  api.imply(packages);

  api.addFiles([
    'lib/core.js',
    'lib/utils.js'
  ], ['client', 'server']);

  api.addFiles([
    'lib/client/blaze.js'
  ], 'client');

  api.addFiles([
    'lib/server/main.js',
    'lib/server/api.js',
    'lib/server/logger.js'
  ], 'server');

  api.export([
    'Launchdock',
    'Logger'
  ]);

});
