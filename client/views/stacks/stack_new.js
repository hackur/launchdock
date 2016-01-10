
AutoForm.hooks({
  insertStackForm: {
    onSuccess(formType, result) {
      FlowRouter.go('stack_page', { _id: result });
      Notify.success('Stack created successfully! ID: ' + result);
    },
    onError(formType, error) {
      Notify.error("Oops! Something went wrong.");
    }
  }
});
