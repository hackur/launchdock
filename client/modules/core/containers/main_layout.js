import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import loading from '../components/loading';
import Layout from '../layouts/main_layout';

export const composer = ({ context }, onData) => {
  const { Meteor, FlowRouter, Collections } = context();
  const { Settings } = Collections;

  const userSub = Meteor.subscribe('users-count');
  const settingsSub = Meteor.subscribe('settings');

  if (userSub.ready() && settingsSub.ready()) {
    const siteTitle = Settings.get('siteTitle');
    const user = Meteor.user();
    if (!user && !Meteor.loggingIn()) {
      return FlowRouter.redirect('/login');
    }
    onData(null, { siteTitle, user });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(Layout);
