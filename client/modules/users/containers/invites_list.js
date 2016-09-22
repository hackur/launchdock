import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '/client/modules/core/components/loading';
import InvitesList from '../components/invites_list';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const { Invitations } = Collections;

  if (Meteor.subscribe('accounts-management').ready()) {
    const invites = Invitations.find().fetch();
    onData(null, invites);
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  revokeInvite: actions.invites.revokeInvite
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(InvitesList);
