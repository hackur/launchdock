
AutoForm.hooks({
  insertStackForm: {
    onSuccess: function(formType, result) {
      // Router.go('stacks_list');
      Notify.success('Stack created successfully! ID: ' + result);
    },
    onError: function(formType, result) {
      Notify.error('Oh no! ' + result);
    }
  }
});
