import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Invitations, Users } from '/lib/collections';

export default function () {

  // user count
  Meteor.publish('users-count', function () {
    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      Counts.publish(this, 'users-count', Users.find());
    }
    return [];
  });

  // single user account
  Meteor.publish('user-account', function (id) {
    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      return [
        Users.find({ _id: id }),
        Stacks.find({ userId: id }),
        Services.find({ userId: id })
      ];
    }
    return [];
  });


  // user logged in state
  Meteor.publish('user-status', function () {
    if (Users.is.admin(this.userId)) {
      return Users.find({}, {
        fields: {
          emails: 1,
          profile: 1,
          status: 1,
          username: 1
        }
      });
    }
    return [];
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
            'emails.address': 1,
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
    }
    return [];
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

}
