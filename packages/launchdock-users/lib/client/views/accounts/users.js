
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

    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      Meteor.call('deleteInvitedUser', this._id, (err, res) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: `Something went wrong deleting the user. <br> ${err}`
          });
        }
      });
    });
  }
});
