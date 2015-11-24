
Template.users.onCreated(function () {
  this.subscribe('accounts-management');
});


Template.users.helpers({
  users() {
    return Users.find();
  }
});


Template.users.events({
  'change [name="user-role"]' (e, t) {
    let options = {
      users: this._id,
      roles: $(e.target).find('option:selected').val()
    }

    Meteor.call( "setUserRoles", options, (err, res) => {
      if (err) {
        Notify.error(err.reason);
        return;
      }
      Notify.success("Successfully updated user role.");
    });
  },

  'click .delete-user' (e, t) {
    e.preventDefault();

    if (window.confirm("Are you sure?! There's no going back!")) {
      Meteor.call('deleteInvitedUser', this._id, (err, res) => {
        if (err) {
          Notify.error(err.error);
        } else {
          Notify.success('User successfully deleted!', 'bottom-right');
        }
      });
    }
  }
});
