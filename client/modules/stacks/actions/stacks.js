export default {

  create({ Meteor, FlowRouter, LocalState, Notify }, options) {
    if (!options.name) {
      return LocalState.set('STACK_CREATE_ERROR', 'Stack name is required.');
    }
    Meteor.call('stacks/create', options, (err, id) => {
      if (err) {
        Notify.error(err);
        return;
      }
      Notify.success('Success!');
      FlowRouter.go(`/stacks/${id}`);
    });
  },

  deleteCert({ Meteor, Alert }, stackId) {
    Alert.confirm({
      title: 'Are you sure?',
      text: 'There\'s no going back!'
    }, () => {
      const relinkApp = true;
      Meteor.call('rancher/deleteStackSSLCert', stackId, relinkApp, (err) => {
        if (err) {
          Alert.error({
            title: 'Oops!',
            text: 'Something went wrong deleting the certificate.'
          });
        } else {
          Alert.success('Success!', 'Certificate deleted.');
        }
      });
    });
  },

  clearErrors({ LocalState }) {
    return LocalState.set('STACK_CREATE_ERROR', null);
  }

};
