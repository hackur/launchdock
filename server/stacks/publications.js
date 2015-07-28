
Meteor.publish('stacks-count', function () {
  Counts.publish(this, 'stacks-count', Stacks.find());
  return [];
});


Meteor.publish('stack-page', function (id) {
  check(id, String);
  var stack = Stacks.find({ _id: id });
  if (stack.userId == this.userId || Users.is.admin(this.userId) ) {
    return stack;
  } else {
    return [];
  }
});


// Limit, filter, and sort handled by reactive-table.
// https://github.com/aslagle/reactive-table#server-side-pagination-and-filtering-beta
ReactiveTable.publish('stacks-list', function () {
  if ( Users.is.admin(this.userId) ) {
    return Stacks;
  } else {
    return [];
  }
});
