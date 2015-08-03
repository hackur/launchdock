
AutoForm.hooks({
  insertStackForm: {
    onSuccess: function(formType, result) {
      FlowRouter.go('stack_page', { _id: result });
      Notify.success('Stack created successfully! ID: ' + result);
    },
    onError: function(formType, error) {
      Notify.error("Oops! " + error.reason);
    }
  }
});
