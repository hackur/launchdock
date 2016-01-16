
Template.invites.onCreated(function () {
  this.subscribe('accounts-management');
});


Template.invites.helpers({
  invitations() {
    return Invitations.find({}, { sort: { createdAt: -1 } });
  },
  hasInvitations() {
    return !!Invitations.find().count();
  },
  openInviteCount() {
    return Invitations.find().count();
  }
});


Template.invites.events({
  'click .revoke-invite' (e, t) {
    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      Meteor.call('revokeInvitation', this._id, (err, res) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: `Something went wrong revoking the invite. <br> ${err}`
          });
        }
      });
    });
  }
});
