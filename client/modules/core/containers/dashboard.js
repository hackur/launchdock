import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import Dashboard from '../components/dashboard';

export const composer = ({ context }, onData) => {
  const { Meteor, Settings } = context();

  if (Meteor.subscribe('settings').ready()) {
    const rancher = Settings.get('rancher', {});
    onData(null, { rancher });
  }
};

export const depsMapper = (context) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Dashboard);
