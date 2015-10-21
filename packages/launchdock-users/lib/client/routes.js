
Launchdock.routes.private.route('/users', {
  name: 'users_list',
  action() {
    BlazeLayout.render('dashboard_layout', { content: 'accounts' });
  }
});

Launchdock.routes.private.route('/users/:_id', {
  name: 'user_account',
  action() {
    BlazeLayout.render('dashboard_layout', { content: 'user_account' });
  }
});

Launchdock.routes.private.route('/users/:_id/edit', {
  name: 'user_edit',
  action() {
    BlazeLayout.render('dashboard_layout', { content: 'user_edit' });
  }
});

Launchdock.routes.public.route('/invite/:token', {
  name: 'accept_invite',
  action() {
    BlazeLayout.render('dashboard_layout', { content: 'accept_invite' });
  }
});
