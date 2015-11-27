
Meteor.methods({

  checkIfShopNameExists(token, name) {

    if (!Launchdock.api.authCheck(token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(name, String);

    const slug = Launchdock.utils.slugify(name);
    const domain = 'https://' + slug + '.getreaction.io';

    return !!Stacks.findOne({ publicUrl: domain });
  },


  checkIfEmailExists(token, email) {

    if (!Launchdock.api.authCheck(token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(email, String);

    return !!Accounts.findUserByEmail(email);
  },


  createReactionAccount(doc) {

    if (!Launchdock.api.authCheck(doc.token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
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

    if (!!Accounts.findUserByEmail(doc.email)) {
      throw new Meteor.Error("Email already registered.");
    }

    doc.shopName = Launchdock.utils.slugify(doc.shopName);
    const shopDomain = doc.shopName + '.getreaction.io';

    const launchdockUsername = Random.id();
    const launchdockAuth = Random.secret();

    const launchdockUserId = Accounts.createUser({
      username: launchdockUsername,
      password: launchdockAuth,
      email: doc.email,
      profile: {
        shopName: doc.shopName,
        shopDomain: shopDomain
      }
    });

    Roles.setUserRoles(launchdockUserId, ['customer']);

    const stackCreateDetails = {
      name: doc.shopName,
      appImage: "reactioncommerce/prequel:latest",
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

    Meteor.call('tutum/createStack', stackCreateDetails, launchdockUserId);

    return launchdockUserId;
  },


  sendReactionInvite(options) {

    if (!Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(options, {
      email: String,
      role: String
    });

    this.unblock();

    if (!!Invitations.findOne({ email: options.email })) {
      const err = "Email has already been invited";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    options.token = Random.hexString(32);
    options.invitedBy = this.userId;

    const url = Launchdock.config.drive.url() + 'invite/' + options.token;
    const emailHtml = 'lib/server/email/invitation.html';

    SSR.compileTemplate('invitation', Assets.getText(emailHtml));
    const content = SSR.render('invitation', { url: url });

    const emailOpts = {
      to: options.email,
      from: "Reaction Commerce <invites@reactioncommerce.com>",
      subject: "You're invited to Reaction Commerce!",
      html: content
    }

    Meteor.defer(() => {
      Email.send(emailOpts);
    });

    Invitations.insert(options);

    Logger.info("Invite successfully sent to " + options.email);

    return true;
  },


  activateInvitation(options) {

    if (!Launchdock.api.authCheck(options.token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(options, {
      token: String, // api token
      email: String,
      password: String,
      shopName: String,
      inviteToken: String
    });

    const invite = Invitations.findOne({ token: options.inviteToken });

    if (!invite) {
      const err = "Invitation not found.";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    // invite can only be used once
    if (invite.accepted) {
      const err = "Invitation has already been used.";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    // drop the unneeded token
    delete options.inviteToken;

    // create a user account and launch a shop
    let userId;
    try {
      Logger.info("Creating new user and shop: " + options.shopName);
      userId = Meteor.call('createReactionAccount', options);
    } catch (err) {
      Logger.error(err);
      return err;
    }

    Invitations.update({ _id: invite._id }, {
      $set: {
        accepted: true,
        acceptedDate: new Date(),
        userId: userId
      }
    }, (err, res) => {
      if (!err) {
        Logger.info("Invitation successfully accepted by " + invite.email);
      }
    });

    return true;
  }

});
