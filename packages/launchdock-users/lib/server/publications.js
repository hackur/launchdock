
// Publish all users to reactive-table (if admin)
// Limit, filter, and sort handled by reactive-table.
// https://github.com/aslagle/reactive-table#server-side-pagination-and-filtering-beta
ReactiveTable.publish("all-users", function() {
  if (Users.is.admin(this.userId)) {
    return Users;
  } else {
    return [];
  }
}, { roles: "customer" });


// single user account
Meteor.publish("user-account", function (id) {
  if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
    return Users.find({ _id: id });
  } else {
    return null;
  }
});


// user logged in state
Meteor.publish("user-status", function () {
  if (Users.is.admin(this.userId)) {
    return Users.find({}, {
      fields: {
        emails: 1,
        profile: 1,
        status: 1,
        username: 1
      }
    });
  } else {
    return null;
  }
});


// Roles
Meteor.publish(null, function () {
  return Meteor.roles.find();
});


// accounts and invites management page
Meteor.publish('accounts-management', function () {
  // only publish to admins and managers
  if (Roles.userIsInRole(this.userId, ['manager', 'admin'])) {

    // by default, only publish customers (for managers)
    let roles = ['customer'];

    // but publish all users for admins
    if (Roles.userIsInRole(this.userId, ['admin'])) {
      roles = ['customer', 'manager', 'admin'];
    }

    return [
      Users.find({ roles: { $in: roles } }, {
        fields: {
          "emails.address": 1,
          roles: 1
        }
      }),
      Invitations.find({ accepted: false, role: { $in: roles } }, {
        fields: {
          email: 1,
          role: 1,
          token: 1,
          createdAt: 1,
          invitedBy: 1
        },
        sort: {
          createdAt: -1
        }
      })
    ];
  } else {
    return null;
  }
});


// invite link landing page
Meteor.publish('invite', function (token) {
  check(token, String);
  return Invitations.find({ token: token }, {
    fields: {
      email: 1,
      token: 1,
      accepted: 1
    }
  });
});
