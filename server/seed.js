// On first start, seed the database with some default data if none exists.

Meteor.startup(() => {

  const defaultUsers = [{
    email: 'root@localhost',
    username: 'admin',
    password: 'admin',
    roles: ['admin', 'superuser']
  }];

  if (Meteor.users.find().count() < 1) {

    _.each(defaultUsers, (user) => {
      const id = Accounts.createUser({
        email: user.email,
        username: user.username,
        password: user.password
      });
      Roles.addUsersToRoles(id, user.roles);
    });

    Logger.info('New default users created!');
  };

  if (Settings.find().count() < 1) {
    Settings.insert({
      siteTitle: 'Launchdock',
      adminEmail: 'admin@launchdock.io'
    });
    Logger.info('Default settings document created');
  }

});
