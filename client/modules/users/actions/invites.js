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
  },

  revokeInvite({ Meteor, Alert, Notify }, inviteId) {
    if (!inviteId) {
      return Notify.error('ERROR: No invite ID provided');
    }

    Alert.confirm({
      title: 'Are you sure?',
      text: 'There\'s no going back!'
    }, () => {
      Meteor.call('revokeInvitation', inviteId, (err) => {
        if (err) {
          Alert.error({
            title: 'Error!',
            text: err.reason
          });
        } else {
          Alert.success('Success!', 'Invite revoked.');
        }
      });
    });
  }

};
