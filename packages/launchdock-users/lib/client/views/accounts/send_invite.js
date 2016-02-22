
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

    Alert.input({
      title: "Bulk invite users from Intercom",
      text: "How many users would you like to invite?"
    }, (userCount) => {
      Alert.confirm({
        title: "Are you absolutely sure?!",
        text: `Do you really want to send an invite email to ${userCount} users?`
      }, () => {
        Meteor.call("reaction/bulkInvite", Number(userCount), (err) => {
          if (err) {
            Alert.error({
              title: "Oops!",
              text: "Something went wrong inviting users. See server errors."
            });
            return;
          }
          Notify.info(`Successfully invited ${userCount.toString()} users!`, "top-right");
        });
      });
    });
  }
});
