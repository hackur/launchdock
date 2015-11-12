
Meteor.methods({

  checkIfShopNameExists(token, name) {

    if (!Launchdock.api.authCheck(token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(name, String);

    let slug = Launchdock.utils.slugify(name);
    let domain = 'https://' + slug + '.getreaction.io';

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
    let shopDomain = doc.shopName + '.getreaction.io';

    let launchdockUsername = Random.id();
    let launchdockAuth = Random.secret();

    let launchdockUserId = Accounts.createUser({
      username: launchdockUsername,
      password: launchdockAuth,
      email: doc.email,
      profile: {
        shopName: doc.shopName,
        shopDomain: shopDomain
      }
    });

    Roles.setUserRoles(launchdockUserId, ['customer']);

    let stackCreateDetails = {
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

    return true;
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

    let url = Launchdock.config.drive.url() + 'invite/' + options.token;
    let emailHtml = 'lib/server/email/invitation.html';

    SSR.compileTemplate('invitation', Assets.getText(emailHtml));
    let content = SSR.render('invitation', { url: url });

    let emailOpts = {
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

    let invite = Invitations.findOne({ token: options.inviteToken });

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
    try {
      Logger.info("Creating new user and shop: " + options.shopName);
      Meteor.call('createReactionAccount', options);
    } catch (err) {
      Logger.error(err);
      return err;
    }

    Invitations.update({ _id: invite._id }, {
      $set: {
        accepted: true,
        acceptedDate: new Date()
      }
    }, (err, res) => {
      if (!err) {
        Logger.info("Invitation successfully accepted by " + invite.email);
      }
    });

    return true;
  },


  revokeInvitation(inviteId) {

    if (!Users.is.admin(this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    check(inviteId, String);

    try {
      Invitations.remove(inviteId);
    } catch (err) {
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    return true;
  }

});
