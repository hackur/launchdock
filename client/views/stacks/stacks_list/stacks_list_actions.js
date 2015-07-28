
Template.stacks_list_actions.events({
  'click .delete-stack': function (e, t) {
    e.preventDefault();
    if (window.confirm("Woah fella!  Are you sure?! There's no going back!")) {
      Meteor.call('tutum/deleteStack', this._id, function(err, res) {
        err ? Notify.error(err) : Notify.success("Successfully deleted stack.");
      });
    }
  }
});
