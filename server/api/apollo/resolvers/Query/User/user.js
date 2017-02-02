import { Users } from '/lib/collections';

export default function (root, { _id }) {
  return Users.findOne(_id);
}
