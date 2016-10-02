import React from 'react';
import { mount } from 'react-mounter';
import MainLayout from '/client/modules/core/containers/main_layout';
import FrontendLayout from '/client/modules/core/containers/frontend_layout';
import UsersList from './containers/users_list';
import UserPage from './containers/user_page';
import InviteAccept from './containers/invite_accept';
import ApiKeysList from './containers/api_keys_list';

export default function (injectDeps, { FlowRouter }) {
  const MainLayoutCtx = injectDeps(MainLayout);
  const FrontendLayoutCtx = injectDeps(FrontendLayout);

  FlowRouter.route('/users', {
    name: 'users_list',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<UsersList />)
      });
    }
  });

  FlowRouter.route('/users/:id', {
    name: 'user_account',
    action({ id }) {
      mount(MainLayoutCtx, {
        content: () => (<UserPage id={id} />)
      });
    }
  });

  FlowRouter.route('/users/:_id/edit', {
    name: 'user_edit',
    action({ id }) {
      mount(MainLayoutCtx, {
        content: () => (<UserEdit id={id} />)
      });
    }
  });

  FlowRouter.route('/invite/:token', {
    name: 'invite_accept',
    action({ token }) {
      mount(FrontendLayoutCtx, {
        content: () => (<InviteAccept token={token} />)
      });
    }
  });

  FlowRouter.route('/api', {
    name: 'api_keys_list',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<ApiKeysList />)
      });
    }
  });

}
