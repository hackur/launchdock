export default {

  sendInvite({ Meteor, Roles, Notify }, email, role) {
    const isManager = Roles.userIsInRole(Meteor.userId(), 'manager');

    const options = {
      email,
      role: isManager ? 'customer' : role
    };

    if (options.email && options.role) {
      if (options.role === 'customer') {
        Meteor.call('sendReactionInvite', options, (err) => {
          if (err) {
            Notify.error(err.error);
          } else {
            Notify.success('Invitation sent!');
          }
        });
      } else {
        Meteor.call('sendUserInvite', options, (err) => {
          if (err) {
            Notify.error(err.error);
          } else {
            Notify.success('Invitation sent!');
          }
        });
      }
    } else {
      Notify.warn('Please set an email and at least one role!');
    }
  }

};
