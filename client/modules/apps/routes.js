import React from 'react';
import { mount } from 'react-mounter';
import MainLayout from '/client/modules/core/containers/main_layout';
import AppsList from './containers/apps_list';
import AppPage from './components/app_page';

export default function (injectDeps, { FlowRouter }) {
  const MainLayoutCtx = injectDeps(MainLayout);

  FlowRouter.route('/apps', {
    name: 'apps_list',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<AppsList />)
      });
    }
  });

  FlowRouter.route('/apps/:_id', {
    name: 'app_page',
    action({ _id }) {
      mount(MainLayoutCtx, {
        content: () => (<AppPage _id={_id} />)
      });
    }
  });
}
