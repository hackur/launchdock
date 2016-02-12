// On first start, seed the database with some default data if none exists.

Meteor.startup(() => {

  const defaultUsers = [{
    email: Settings.get("LD_EMAIL", "root@localhost"),
    username: Settings.get("LD_USERNAME", "admin"),
    password: Settings.get("LD_PASSWORD", "admin"),
    roles: ["admin", "superuser"]
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

    Logger.info("New default users created!");
  };

  if (Settings.find().count() < 1) {
    Settings.insert({
      siteTitle: "Launchdock",
      adminEmail: Settings.get("LD_EMAIL", "root@localhost"),
      mongoImage: Settings.get("mongoImage", "launchdock/mongo-rep-set:latest"),
      wildcardDomain: Settings.get("wildcardDomain"),
      defaultPlatform: Settings.get("defaultPlatform", "Rancher"),
    });
    Logger.info("Default settings document created");
  }

});
