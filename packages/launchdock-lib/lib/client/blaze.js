
Template.registerHelper('moment', function (date, format) {
  return moment(date).format(format);
})

Template.registerHelper('timeAgo', function (date) {
  return moment(date).fromNow();
})
