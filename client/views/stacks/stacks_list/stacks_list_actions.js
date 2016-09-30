import { Notify, Alert } from '/client/modules/core/configs/notifications';

Template.stacks_list_actions.events({
  'click .delete-stack'(e) {
    // hard delete if ALT+click, else confirm prompt
    if (e.altKey) {
      Meteor.call('rancher/deleteStack', this._id, (err) => {
        if (err) {
          Alert.error({
            title: 'Oops!',
            text: 'Something went wrong deleting the stack.'
          });
          return;
        }
        Notify.success('Successfully deleted!', 'top-right');
      });
    } else {
      Alert.confirm({
        title: 'Are you sure?',
        text: 'There\'s no going back!'
      }, () => {
        Meteor.call('rancher/deleteStack', this._id, (err) => {
          if (err) {
            Alert.error({
              title: 'Oops!',
              text: 'Something went wrong deleting the stack.'
            });
          } else {
            Alert.success('Success!', 'Stack deleted.');
          }
        });
      });
    }
  }
});
