import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import AppSettings from '../components/app_settings';

export const composer = ({ context }, onData) => {
  const { Meteor, Settings } = context();

  if (Meteor.subscribe('settings').ready()) {
    const settings = Settings.findOne();
    onData(null, { settings });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  update: actions.settings.update
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AppSettings);
