import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Stacks, Services } from '/lib/collections';


export default function() {

  Meteor.publish('stacks-count', function() {
    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      Counts.publish(this, 'stacks-count', Stacks.find());
    }
    return [];
  });

  Meteor.publish('stacks-list', function() {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      return Stacks.find();
    }
    return [];
  });

  Meteor.publish('stack-page', function(_id) {
    check(_id, String);
    const stack = Stacks.findOne({ _id });
    if (stack.userId === this.userId || Roles.userIsInRole(this.userId, 'admin')) {
      return [
        Stacks.find({ _id }),
        Services.find({ stackId: _id })
      ];
    }
    return [];
  });

  // Limit, filter, and sort handled by reactive-table.
  // https://github.com/aslagle/reactive-table#server-side-pagination-and-filtering-beta
  ReactiveTable.publish('stacks-list', function() {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      return Stacks;
    }
    return [];
  });

}
