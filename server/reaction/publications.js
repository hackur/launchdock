import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Stacks, Users } from '/lib/collections';
import { Logger } from '/server/api';

export default function () {

  Meteor.publish('reaction-account-info', function (id) {

    const logger = Logger.child({
      meteor_publication: 'reaction-account-info',
      meteor_publication_args: id,
      userId: this.userId
    });

    check(id, String);

    const subName = 'reaction-account-info';
    const uid = this.userId;

    if (!this.userId) {
      return [];
    }

    const stack = Stacks.findOne({ _id: id });

    if (!stack) {
      logger.warn(`[${subName}] Reaction user ${uid} subscribed to unknown stack id ${id}`);
      return [];
    }

    if (this.userId === stack.userId || Roles.userIsInRole(this.userId, 'admin')) {
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

    logger.warn(`[${subName}] Reaction user ${uid} subscribed to a stack id they don't own: ${id}`
                , this.userId);
    return [];
  });

}
