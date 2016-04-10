import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '../components/loading.jsx';
import error from '../components/error.jsx';
import Dashboard from '../components/dashboard.jsx';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const countSub = Meteor.subscribe('stacks-count');

  if (countSub.ready()) {
    const count = Counts.get('stacks-count');
    onData(null, { count });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading, error),
  useDeps(depsMapper)
)(Dashboard);
