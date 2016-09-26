import { useDeps, composeAll, composeWithTracker } from 'mantra-core';
import loading from '../components/loading';
import Layout from '../layouts/frontend_layout';

export const composer = ({ context }, onData) => {
  const { FlowRouter, Collections } = context();
  const { Settings } = Collections;

  FlowRouter.subsReady('settings', () => {
    const siteTitle = Settings.get('siteTitle');
    onData(null, { siteTitle });
  });
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(Layout);
