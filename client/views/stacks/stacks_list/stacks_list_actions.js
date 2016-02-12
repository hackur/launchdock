
Template.stacks_list_actions.events({
  "click .delete-stack"() {
    const stack = Template.instance().data;
    const platform = stack.platform.toLowerCase();

    Alert.confirm({
      title: "Are you sure?",
      text: "There's no going back!"
    }, () => {
      Meteor.call(`${platform}/deleteStack`, this._id, (err) => {
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
