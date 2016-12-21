import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import Dashboard from '../components/dashboard';

export const composer = ({ context }, onData) => {
  const { Meteor, Settings } = context();

  if (Meteor.subscribe('settings').ready()) {
    const settings = Settings.findOne();
    onData(null, { settings });
  }
};

export const depsMapper = (context) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Dashboard);
