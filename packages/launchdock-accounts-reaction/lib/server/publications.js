
Meteor.publish("reaction-account-info", function (id) {
  check(id, String);

  if (!this.userId) {
    return;
  }

  const stack = Stacks.findOne({ _id: id });

  if (!stack) {
    return;
  }

  if (Users.is.owner(this.userId, stack) || Users.is.admin(this.userId)) {
    return [
      Users.find({ _id: stack.userId }, {
        fields: {
          stripe: 1,
          subscription: 1
        }
      }),
      Stacks.find({ _id: id }, {
        fields: {
          defaultDomain: 1,
          endpoint: 1,
          state: 1,
          createdAt: 1
        }
      })
    ]
  } else {
    return [];
  }
});
