// On first start, seed the database with some default data if none exists.

Meteor.startup(function() {

  var defaultUsers = [{
    email: 'jeremy.shimko@gmail.com',
    password: 'admin',
    username: 'admin',
    profile: {
      first_name: 'Jeremy',
      last_name: 'Shimko'
    },
    roles: ['admin']
  }];

  if (Meteor.users.find().count() < 1) {

    _.each(defaultUsers, function(user) {
      var id;

      id = Accounts.createUser({
        email: user.email,
        password: user.password,
        username: user.username,
        profile: {
          first_name: user.profile.first_name,
          last_name: user.profile.last_name
        }
      });

      if (user.roles.length > 0) {
        // Need _id of existing user record so this call must come
        // after `Accounts.createUser` or `Accounts.onCreate`
        Roles.addUsersToRoles(id, user.roles);
      }
    });

    console.log('New default users created!');
  };

  if (Settings.find().count() < 1) {
    var id = Settings.insert({siteTitle: 'Launchdock'});
    console.log('Default settings document created: ', id);
  }
});
