
Template.send_invite.onRendered(function () {
  $('.modal-trigger').leanModal();
});


Template.send_invite.events({
  'click button[type="submit"]' (e, t) {
    e.preventDefault();

    let isManager = Roles.userIsInRole(Meteor.userId(), 'manager');

    let options = {
      email: t.find("[name='email']").value,
      role: isManager ? 'customer' : t.find("[name='invite-user-role'] option:selected").value
    }

    if (options.email && options.role) {
      if (options.role === 'customer') {
        Meteor.call('sendReactionInvite', options, (err, res) => {
          if (err) {
            Notify.error(err.error);
          } else {
            $('#invite-modal').closeModal();
            Notify.success('Invitation sent!');
          }
        });
      } else {
        Meteor.call('sendUserInvite', options, (err, res) => {
          if (err) {
            Notify.error(err.error);
          } else {
            $('#invite-modal').closeModal();
            Notify.success('Invitation sent!');
          }
        });
      }
    } else {
      Notify.warn('Please set an email and at least one role!');
    }
  }
});
