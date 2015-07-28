
Router.route('/', function () {
  this.render('dashboard');
});

Router.route('/logout', function () {
  Meteor.logout();
  this.redirect('/');
});
