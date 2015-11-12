
Template.stack_ssl.onCreated(function() {
  this.autorun(() => {
    const stackId = FlowRouter.getParam('_id');
    this.subscribe('stack-page', stackId);
  });
});

Template.stack_ssl.helpers({
  currentStack() {
    return Stacks.findOne();
  }
});


AutoForm.hooks({
  sslUpdateForm: {

    onSuccess(formType, result) {
      Notify.success("Success!");
    },

    onError(formType, error) {
      Notify.error("Oops. " + error.reason);
    }

  }
});
