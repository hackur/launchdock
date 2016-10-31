import React from 'react';
import { mount } from 'react-mounter';
import MainLayout from './containers/main_layout';
import FrontendLayout from './containers/frontend_layout';
import Login from './components/login';
import Dashboard from './containers/dashboard';
import NotFound from './components/not_found';

export default function (injectDeps, { FlowRouter, Meteor }) {
  const MainLayoutCtx = injectDeps(MainLayout);
  const FrontendLayoutCtx = injectDeps(FrontendLayout);

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
      mount(FrontendLayoutCtx, {
        content: () => (<Login />)
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
