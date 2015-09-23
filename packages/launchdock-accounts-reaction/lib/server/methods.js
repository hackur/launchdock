
Meteor.methods({

  'createReactionAccount': function(req) {

    if (!Launchdock.api.authCheck(req.token, this.userId)) {
      throw new Meteor.Error("AUTH ERROR: Invalid credentials");
    }

    check(req, {
      token: String,
      shopName: String,
      email: String,
      password: String
    });

    req.shopName = Launchdock.utils.slugify(req.shopName);
    var shopDomain = req.shopName + '.getreaction.io';

    var launchdockUsername = Random.id();
    var launchdockAuth = Random.secret();

    var launchdockUserId = Accounts.createUser({
      username: launchdockUsername,
      password: launchdockAuth,
      email: req.email,
      profile: {
        shopName: req.shopName,
        shopDomain: shopDomain
      }
    });

    Roles.addUsersToRoles(launchdockUserId, 'app-owner');

    stackCreateDetails = {
      name: req.shopName,
      appImage: "jshimko/reaction:devel",
      domainName: shopDomain,
      appEnvVars: [
        {
          "key": "METEOR_EMAIL",
          "value": req.email
        }, {
          "key": "METEOR_AUTH",
          "value": req.password
        }, {
          "key": "LAUNCHDOCK_USERID",
          "value": launchdockUserId
        }, {
          "key": "LAUNCHDOCK_USERNAME",
          "value": launchdockUsername
        }, {
          "key": "LAUNCHDOCK_AUTH",
          "value": launchdockAuth
        }, {
          "key": "LAUNCHDOCK_URL",
          "value": Meteor.absoluteUrl()
        }
      ],
      token: req.token
    };

    Meteor.call('tutum/createStack', stackCreateDetails);

    return true;
  }

});
