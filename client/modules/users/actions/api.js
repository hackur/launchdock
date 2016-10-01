import { Random } from 'meteor/random';

export default {
  createApiKey({}, callback) {
    callback(Random.id(25), Random.id(35));
  },

  saveApiKey({ Meteor, LocalState, Notify }, options, callback) {
    LocalState.set('API_KEY_CREATE_ERROR', null);

    if (!options.name) {
      return LocalState.set('API_KEY_CREATE_ERROR', 'Name is required');
    }

    if (!options.username || !options.secret) {
      return LocalState.set('API_KEY_CREATE_ERROR', 'ERROR: API credentials not found');
    }

    Meteor.call('api/addKey', options, (err, res) => {
      if (err) {
        callback(err);
        return LocalState.set('API_KEY_CREATE_ERROR', err.reason);
      }
      Notify.success('New API key created!');
      callback(null, res);
    });
  },

  deleteApiKey({ Meteor, Alert, LocalState }, keyId) {
    LocalState.set('API_KEY_DELETE_ERROR', null);

    if (!keyId) {
      return LocalState.set('API_KEY_DELETE_ERROR', 'ID is required');
    }

    Alert.confirm({
      title: 'Are you sure?',
      text: 'There\'s no going back!'
    }, () => {
      Meteor.call('api/deleteKey', keyId, (err) => {
        if (err) {
          Alert.error({
            title: 'Oops!',
            text: `Something went wrong deleting the API key: ${err.reason}`
          });
        } else {
          Alert.success('Success!', 'API key deleted.');
        }
      });
    });
  }
};
