
Template.user_account.onCreated(function () {
  this.autorun(() => {
    const userId = FlowRouter.getParam('_id');
    this.subscribe('user-account', userId);
  });
});


Template.user_account.helpers({
  user() {
    return Users.findOne(FlowRouter.getParam('_id'));
  },

  canEditProfile() {
    const user = Meteor.user();
    const profileId = FlowRouter.getParam('_id');

    // if owns the profile
    return !!(user._id === profileId);
  },

  stacks() {
    return Stacks.find();
  },

  hasStacks() {
    return !!Stacks.find().count();
  }
});
