
Template.top_nav.events({

  'click #logout': function (e) {
    e.preventDefault();
    Meteor.logout(function () {
      Router.go('/login');
    });
  }

});
