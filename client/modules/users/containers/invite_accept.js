import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import loading from '/client/modules/core/components/loading';
import InviteAccept from '../components/invite_accept';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();

  onData(null, {});
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(InviteAccept);
