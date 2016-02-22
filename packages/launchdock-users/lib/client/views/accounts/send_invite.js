
Template.send_invite.events({
  "click button.invite-user"(e, t) {
    e.preventDefault();

    const isManager = Roles.userIsInRole(Meteor.userId(), "manager");

    const options = {
      email: t.find("[name='invite-user-email']").value,
      role: isManager ? "customer" : t.find("[name='invite-user-role'] option:selected").value
    };

    if (options.email && options.role) {
      if (options.role === "customer") {
        Meteor.call("sendReactionInvite", options, (err) => {
          if (err) {
            Notify.error(err.error);
          } else {
            $("#invite-user-modal").modal("hide");
            Notify.success("Invitation sent!");
          }
        });
      } else {
        Meteor.call("sendUserInvite", options, (err) => {
          if (err) {
            Notify.error(err.error);
          } else {
            $("#invite-user-modal").modal("hide");
            Notify.success("Invitation sent!");
          }
        });
      }
    } else {
      Notify.warn("Please set an email and at least one role!");
    }
  },

  "click button.bulk-invite"(e) {
    e.preventDefault();

    Alert.confirm({
      title: "Are you sure?",
      text: "You're about to invite a bunch of users!"
    }, () => {
      Meteor.call("reaction/bulkInvite", (err) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: "Something went wrong inviting users."
          });
        }
        Notify.info("Successfully invited bulk users!", "top-right");
      });
    });

  }
});
