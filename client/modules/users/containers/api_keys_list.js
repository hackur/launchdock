import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import ApiKeysList from '../components/api_keys_list';

export const composer = ({ context }, onData) => {
  const { Meteor, Roles, LocalState } = context();

  if (Meteor.subscribe('api-keys').ready()) {
    const apiKeys = Roles.getUsersInRole('api').fetch();

    const canDelete = (apiKey) => {
      const currentUserId = Meteor.userId();
      const isAdmin = Roles.userIsInRole(currentUserId, 'superuser');
      return isAdmin || apiKey.createdBy === currentUserId;
    };

    const error = LocalState.get('API_KEY_DELETE_ERROR');

    onData(null, { apiKeys, canDelete, error });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  deleteApiKey: actions.api.deleteApiKey
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ApiKeysList);
