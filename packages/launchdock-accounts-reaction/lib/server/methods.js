
Meteor.methods({

  'checkIfShopNameExists': function (token, name) {

    if (!Launchdock.api.authCheck(token, this.userId)) {
      var err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(name, String);

    var slug = Launchdock.utils.slugify(name);
    var domain = 'https://' + slug + '.getreaction.io';

    return !!Stacks.findOne({ publicUrl: domain });
  },


  'checkIfEmailExists': function (token, email) {

    if (!Launchdock.api.authCheck(token, this.userId)) {
      var err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(email, String);

    return !!Accounts.findUserByEmail(email);
  },


  'createReactionAccount': function (doc) {

    if (!Launchdock.api.authCheck(doc.token, this.userId)) {
      var err = "AUTH ERROR: Invalid credentials";
      Logger.error(err, {
        "package": "launchdock-accounts-reaction",
        "type": "method",
        "method-name": "createReactionAccount",
        "method-args": doc
      });
      throw new Meteor.Error(err);
    }

    check(doc, {
      token: String,
      shopName: String,
      email: String,
      password: String
    });

    doc.shopName = Launchdock.utils.slugify(doc.shopName);
    var shopDomain = doc.shopName + '.getreaction.io';

    var launchdockUsername = Random.id();
    var launchdockAuth = Random.secret();

    var launchdockUserId = Accounts.createUser({
      username: launchdockUsername,
      password: launchdockAuth,
      email: doc.email,
      profile: {
        shopName: doc.shopName,
        shopDomain: shopDomain
      }
    });

    Roles.addUsersToRoles(launchdockUserId, 'customer');

    var stackCreateDetails = {
      name: doc.shopName,
      appImage: "reactioncommerce/prequel:1.2",
      domainName: shopDomain,
      appEnvVars: [
        {
          "key": "REACTION_EMAIL",
          "value": doc.email
        }, {
          "key": "REACTION_AUTH",
          "value": doc.password
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
        }, {
          "key": "MAIL_URL",
          "value": "smtp://postmaster%40mail.launchdock.io:b442e6eb2aa294ccc86360f0c647adcd@smtp.mailgun.org:587"
        }
      ],
      token: doc.token
    };

    Meteor.call('tutum/createStack', stackCreateDetails);

    return true;
  }

});
