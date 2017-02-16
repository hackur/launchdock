export default {

  sendInvite({ Meteor, Roles, Notify }, { email, role, api, appName }) {
    const options = {
      email,
      role: Roles.userIsInRole(Meteor.userId(), 'admin') ? role : 'customer',
      api,
      appName
    };

    console.log(options);

    if (options.email && options.role) {
      if (api) {
        Meteor.call('sendUserInvite', options, (err) => {
          if (err) {
            Notify.error(err.error);
          } else {
            Notify.success('Invitation sent!');
          }
        });
      } else if (options.role === 'customer') {
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

  acceptInvite({ Meteor, FlowRouter, Notify, LocalState }, options) {
    LocalState.set('ACTIVATE_INVITE_ERROR', null);

    const { username, email, password, password2 } = options;

    if (!username) {
      return LocalState.set('ACTIVATE_INVITE_ERROR', 'Please choose a username');
    }

    if (!password) {
      return LocalState.set('ACTIVATE_INVITE_ERROR', 'Password is required');
    }

    if (password !== password2) {
      return LocalState.set('ACTIVATE_INVITE_ERROR', 'Passwords do not match');
    }

    const inviteToken = FlowRouter.getParam('token');

    if (!inviteToken) {
      return Notify.error('Invite not found!');
    }

    Meteor.call('activateUserInvite', { username, email, password, inviteToken }, (err) => {
      if (err) {
        return LocalState.set('ACTIVATE_INVITE_ERROR', err.error);
      }
      Meteor.loginWithPassword(email, password, (error) => {
        if (!error) {
          FlowRouter.go('/');
          Notify.success('Success!', 'bottom-right');
        }
      });
    });
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
          Notify.success('Invitation revoked!', 'top-right');
        }
      });
    });
  }
};
