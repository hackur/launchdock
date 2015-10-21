
FlowRouter.route('/users', {
  name: 'users_list',
  action: function() {
    BlazeLayout.render('dashboard_layout', { content: 'accounts' });
  }
});

FlowRouter.route('/users/:_id', {
  name: 'user_account',
  action: function() {
    BlazeLayout.render('dashboard_layout', { content: 'user_account' });
  }
});

FlowRouter.route('/users/:_id/edit', {
  name: 'user_edit',
  action: function() {
    BlazeLayout.render('dashboard_layout', { content: 'user_edit' });
  }
});

FlowRouter.route('/invite/:token', {
  name: 'accept_invite',
  action: function() {
    BlazeLayout.render('dashboard_layout', { content: 'accept_invite' });
  }
});
