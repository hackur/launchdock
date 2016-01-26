
Meteor.methods({

  createReactionAccount(doc) {

    const logger = Logger.child({
      meteor_method: 'createReactionAccount',
      meteor_method_args: doc
    });

    if (!Launchdock.api.authCheck(doc.token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    check(doc, {
      token: String,
      shopName: String,
      email: String,
      password: String
    });

    if (!!Accounts.findUserByEmail(doc.email)) {
      const err = "Email already registered.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    const shopNameSlug = Launchdock.utils.slugify(doc.shopName);

    const launchdockUsername = Random.id();
    const launchdockAuth = Random.secret();

    const launchdockUserId = Accounts.createUser({
      username: launchdockUsername,
      password: launchdockAuth,
      email: doc.email,
      profile: {
        shopName: doc.shopName
      },
      "subscription.status": "trial"
    });

    logger.info("New Reaction user created.");

    Roles.setUserRoles(launchdockUserId, ['customer']);

    logger.debug(`User ${launchdockUserId} role updated to customer`);

    const stackCreateDetails = {
      name: shopNameSlug,
      appImage: "reactioncommerce/reaction:latest",
      appEnvVars: [
        {
          "key": "REACTION_SHOP_NAME",
          "value": doc.shopName
        }, {
          "key": "REACTION_EMAIL",
          "value": doc.email
        }, {
          "key": "REACTION_AUTH",
          "value": doc.password
        }, {
          "key": "METEOR_USER",
          "value": doc.email
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
          "value": process.env.MAIL_URL
        }
      ],
      token: doc.token
    };

    Meteor.call('tutum/createStack', stackCreateDetails, launchdockUserId);

    analytics.identify({
      userId: launchdockUserId,
      traits: {
        email: doc.email,
        username: launchdockUsername,
        shopName: doc.shopName,
        plan: "trial"
      }
    });

    analytics.track({
      userId: launchdockUserId,
      event: "New Reaction shop launched",
      properties: {
        shopName: doc.shopName,
        plan: "trial"
      }
    });

    return launchdockUserId;
  },


  sendReactionInvite(options) {

    const logger = Logger.child({
      meteor_method: 'sendReactionInvite',
      meteor_method_args: options,
      userId: this.userId
    });

    if (!Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      const err = "AUTH ERROR: Invalid credentials";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    check(options, {
      email: String,
      role: String
    });

    this.unblock();

    if (!!Invitations.findOne({ email: options.email })) {
      const err = "Email has already been invited";
      logger.error(err);
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

    const msg = `${options.email} has been invited to Reaction.`;
    Meteor.call("util/slackMessage", msg);

    logger.info(`Invite successfully sent to ${options.email}`);

    return true;
  },


  activateInvitation(options) {

    const logger = Logger.child({
      meteor_method: 'activateInvitation',
      meteor_method_args: options
    });

    if (!Launchdock.api.authCheck(options.token, this.userId)) {
      const err = "AUTH ERROR: Invalid credentials";
      logger.error(err);
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
      logger.error(err);
      throw new Meteor.Error(err);
    }

    // invite can only be used once
    if (invite.accepted) {
      const err = "Invitation has already been used.";
      logger.error(err);
      throw new Meteor.Error(err);
    }

    // drop the unneeded token
    delete options.inviteToken;

    // create a user account and launch a shop
    let userId;
    try {
      logger.info(`Creating new user and shop: ${options.shopName}`);
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
    }, (err, num) => {
      if (!err) {
        logger.info(`Invitation successfully accepted by ${invite.email}`);
      }
    });

    const msg = `${invite.email} has accepted their invite to Reaction!`;
    Meteor.call("util/slackMessage", msg);

    analytics.track({
      userId: userId,
      event: "Reaction invite accepted",
      properties: {
        shopName: options.shopName,
        plan: "trial"
      }
    });

    return true;
  }

});
