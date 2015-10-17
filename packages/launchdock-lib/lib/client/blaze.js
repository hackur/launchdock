// date helpers
Template.registerHelper('moment', (date, format) => {
  return moment(date).format(format);
});

Template.registerHelper('timeAgo', (date) => {
  return moment(date).fromNow();
});


// user helpers
Template.registerHelper('isAdmin', (id) => {
  return Roles.userIsInRole(id, 'admin');
});

Template.registerHelper('isCurrentUser', (currentUser) => {
  return (currentUser === Meteor.userId());
});

Template.registerHelper('disableIfAdmin', (userId) => {
  if (Meteor.userId() === userId) {
    return Roles.userIsInRole(userId, 'admin') ? "disabled" : "";
  }
});


// misc
Template.registerHelper('isEqual', (val1, val2) => {
  return (val1 === val2);
});
