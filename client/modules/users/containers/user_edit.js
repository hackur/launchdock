import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '/client/modules/core/components/loading';
import UserEdit from '../components/user_edit';

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
)(UserEdit);
