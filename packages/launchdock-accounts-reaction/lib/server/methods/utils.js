
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
  }

});
