
Template.stacks_list_actions.events({
  'click .delete-stack' (e, t) {
    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      Meteor.call('tutum/deleteStack', this._id, (err, res) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: `Something went wrong deleting the stack. <br> ${err}`
          });
        }
      });
    });
  }
});
