import { Users } from '/lib/collections';

export default function (root, params, context) {
  return Users.findOne(context.userId);
}
