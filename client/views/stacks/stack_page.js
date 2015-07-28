
Template.stack_page.helpers({
  stack: function () {
    return Stacks.findOne();
  }
});
