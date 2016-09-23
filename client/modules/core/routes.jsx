import React from 'react';
import { mount } from 'react-mounter';
import { Accounts } from 'meteor/jeremy:react-accounts-ui';
import MainLayout from './layouts/main_layout';
import LoginLayout from './layouts/login_layout';
import Dashboard from './containers/dashboard';
import NotFound from './components/not_found';

export default function(injectDeps, { FlowRouter, Meteor }) {
  const MainLayoutCtx = injectDeps(MainLayout);

  // enforce login
  function mustBeLoggedIn() {
    if (!Meteor.user() && !Meteor.loggingIn()) {
      FlowRouter.redirect('/login');
    }
  }
  FlowRouter.triggers.enter([mustBeLoggedIn], { except: ['login'] });

  // Global subscriptions
  FlowRouter.subscriptions = function() {
    this.register('settings', Meteor.subscribe('settings'));
  };

  FlowRouter.route('/', {
    name: 'home',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<Dashboard />)
      });
    }
  });

  FlowRouter.route('/login', {
    name: 'login',
    action() {
      mount(LoginLayout, {
        content: () => (<Accounts.UI.LoginForm />)
      });
    }
  });

  FlowRouter.route('/logout', {
    name: 'logout',
    action() {
      Meteor.logout(() => {
        FlowRouter.go('/login');
      });
    }
  });

  FlowRouter.notFound = {
    action() {
      mount(MainLayoutCtx, {
        content: () => (<NotFound />)
      });
    }
  };

}
