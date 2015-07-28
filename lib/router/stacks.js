
Router.route('/stacks', {
  name: 'stacks_list'
});

Router.route('/stacks/new', {
  name: 'stack_new'
});

Router.route('/stacks/:_id', {
  name: 'stack_page',
  waitOn: function () {
    Meteor.subscribe('stack-page', this.params._id);
  },
  data: function () {
    return Stacks.find();
  }
});
