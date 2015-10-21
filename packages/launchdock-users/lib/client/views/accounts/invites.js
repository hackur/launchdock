
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
    if (confirm("Are you sure? This can't be undone.")) {
      Meteor.call( "revokeInvitation", this._id, (err, res) => {
        if (err) {
          Notify.error(err.reason);
        } else {
          Notify.success("Invitation revoked!");
        }
      });
    }
  }
});
