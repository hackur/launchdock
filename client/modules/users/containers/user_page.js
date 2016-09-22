import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '/client/modules/core/components/loading';
import UserPage from '../components/user_page';

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
)(UserPage);
