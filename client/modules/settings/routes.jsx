import React from 'react';
import { mount } from 'react-mounter';
import MainLayout from '/client/modules/core/layouts/main_layout.jsx';
import SettingsPage from './containers/settings_page';


export default function(injectDeps, { FlowRouter }) {
  const MainLayoutCtx = injectDeps(MainLayout);

  FlowRouter.route('/settings', {
    name: 'settings_page',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<SettingsPage />)
      });
    }
  });
}
