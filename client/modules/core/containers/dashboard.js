import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import loading from '../components/loading';
import error from '../components/error';
import Dashboard from '../components/dashboard';

export const composer = ({ context }, onData) => {
  const { Meteor } = context();

  if (Meteor.subscribe('dashboard').ready()) {
    const count = Counts.get('stacks-count');
    onData(null, { count });
  }
};

export const depsMapper = (context) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading, error),
  useDeps(depsMapper)
)(Dashboard);
