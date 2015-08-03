Package.describe({
  name: 'launchdock:lib',
  summary: 'Launchdock lib package.'
});

Package.onUse(function(api) {

  api.versionsFrom(['METEOR@1.1.0.2']);

  var packages = [
    'meteor-platform',
    'accounts-base',
    'accounts-password',
    'email',
    'http',
    'jquery',
    'reactive-var',
    'reactive-dict',
    'templating',
    'kadira:flow-router',
    'kadira:blaze-layout',
    'arillo:flow-router-helpers',
    'zimme:active-route',
    'ongoworks:security',
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
    'momentjs:moment'
  ];

  api.use(packages);

  api.imply(packages);

  api.addFiles([
    'lib/client/blaze.js'
  ], 'client');

});
