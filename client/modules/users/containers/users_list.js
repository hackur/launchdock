import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '/client/modules/core/components/loading.jsx';
import UsersList from '../components/users_list.jsx';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const { Users, Invitations } = Collections;

  if (Meteor.subscribe('accounts-management').ready()) {
    const users = Users.find().fetch();
    const invites = Invitations.find().fetch();
    onData(null, { users, invites });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(UsersList);
