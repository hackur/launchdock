import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import AppsList from '../components/apps_list';

export const composer = ({ context }, onData) => {
  const { Meteor, Roles } = context();
  const isAdmin = Roles.userIsInRole(Meteor.user(), 'admin');
  onData(null, { isAdmin });
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AppsList);
