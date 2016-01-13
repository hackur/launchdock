Package.describe({
  name: 'launchdock:users',
  summary: 'Launchdock users.'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.2.1']);

  api.use([
    'launchdock:core',
    'launchdock:lib'
  ]);

  api.addFiles([
    'lib/common/namespace.js',
    'lib/common/roles.js',
    'lib/common/invitations.js'
  ], ['client', 'server']);

  api.addFiles([
    'lib/client/views/accounts/accept_invite.html',
    'lib/client/views/accounts/accept_invite.js',
    'lib/client/views/accounts/accounts.html',
    'lib/client/views/accounts/invites.html',
    'lib/client/views/accounts/invites.js',
    'lib/client/views/accounts/send_invite.html',
    'lib/client/views/accounts/send_invite.js',
    'lib/client/views/accounts/users.html',
    'lib/client/views/accounts/users.js',
    'lib/client/routes.js'
  ], 'client');

  api.addFiles([
    'lib/server/main.js',
    'lib/server/methods.js',
    'lib/server/permissions.js',
    'lib/server/publications.js'
  ], 'server');

  api.addAssets([
    'lib/server/email/templates/user-invitation.html'
  ], 'server');

  api.export([
    'Users',
    'Invitations'
  ]);

});
