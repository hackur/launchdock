import { composeWithTracker, composeAll } from 'react-komposer';
import { useDeps } from 'react-simple-di';
import loading from '../components/loading';
import error from '../components/error';
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

export default composeAll(
  composeWithTracker(composer, loading, error),
  useDeps(depsMapper)
)(Dashboard);
