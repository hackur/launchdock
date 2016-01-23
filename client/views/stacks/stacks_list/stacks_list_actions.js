
Template.stacks_list_actions.events({
  "click .delete-stack"() {
    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      Meteor.call("tutum/deleteStack", this._id, (err) => {
        if (err) {
          Alert.error({
            title: "Oops!",
            text: `Something went wrong deleting the stack.`
          });
        }
      });
    });
  }
});
