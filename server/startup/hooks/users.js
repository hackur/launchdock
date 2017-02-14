import { Accounts } from 'meteor/accounts-base';
import { Hooks } from '/lib/api';

export default function () {
  Accounts.onCreateUser((options, user) => {
    // All registered hooks for onCreateUser MUST return the user object
    // or the user creation will fail
    return Hooks.Events.run('onCreateUser', user);
  });

  Accounts.onLogin((details) => {
    Hooks.Events.run('onLogin', details);
  });

  Accounts.onLoginFailure((details) => {
    Hooks.Events.run('onLoginFailure', details);
  });

  Accounts.onLogout((details) => {
    Hooks.Events.run('onLogout', details);
  });
}
