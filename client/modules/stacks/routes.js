import React from 'react';
import { mount } from 'react-mounter';
import MainLayout from '/client/modules/core/layouts/main_layout';
import StacksList from './containers/stacks_list';
import StackNew from './containers/stack_new';
import StackPage from './containers/stack_page';
import StackSSL from './containers/stack_ssl';

export default function (injectDeps, { FlowRouter }) {
  const MainLayoutCtx = injectDeps(MainLayout);

  FlowRouter.route('/stacks', {
    name: 'stacks_list',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<StacksList />)
      });
    }
  });

  FlowRouter.route('/stacks/new', {
    name: 'stacks_new',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<StackNew />)
      });
    }
  });

  FlowRouter.route('/stacks/:id', {
    name: 'stack_page',
    action({ id }) {
      mount(MainLayoutCtx, {
        content: () => (<StackPage id={id}/>)
      });
    }
  });

  FlowRouter.route('/stacks/:id/ssl', {
    name: 'stack_ssl',
    action({ id }) {
      mount(MainLayoutCtx, {
        content: () => (<StackSSL id={id}/>)
      });
    }
  });
}
