import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import Layout from '../layouts/frontend_layout';

export const composer = ({ context }, onData) => {
  const { Settings } = context();
  const siteTitle = Settings.get('siteTitle');
  onData(null, { siteTitle });
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Layout);
