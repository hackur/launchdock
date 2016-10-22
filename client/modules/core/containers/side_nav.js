import { composeWithTracker, composeAll } from 'react-komposer';
import { useDeps } from 'react-simple-di';
import loading from '../components/loading';
import SideNav from '../components/side_nav';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const { Settings } = Collections;

  const userSub = Meteor.subscribe('users-count');
  const settingsSub = Meteor.subscribe('settings');

  if (userSub.ready() && settingsSub.ready()) {
    const siteTitle = Settings.get('siteTitle');
    const user = Meteor.user() || {};
    onData(null, { siteTitle, user });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(SideNav);
