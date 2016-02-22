
Meteor.publish("reaction-account-info", function(id) {
  check(id, String);
  const subName = "reaction-account-info";
  const uid = this.userId;

  if (!this.userId) {
    return [];
  }

  const stack = Stacks.findOne({ _id: id });

  if (!stack) {
    Logger.warn(`[${subName}] Reaction user ${uid} subscribed to unknown stack id ${id}`);
    return [];
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
    ];
  }

  Logger.warn(`[${subName}] Reaction user ${uid} subscribed to a stack id they don't own: ${id}`);
  return [];
});
