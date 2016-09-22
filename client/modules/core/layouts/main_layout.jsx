import React from 'react';
import SideNav from '../components/side_nav';
import Alert from 'react-s-alert';

class MainLayout extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: !!Meteor.user(),
      sidebarToggled: false
    };
  }

  componentWillMount() {
    if (!this.state.isAuthenticated) {
      FlowRouter.go('/login');
    }
  }

  componentDidUpdate() {
    if (!this.state.isAuthenticated) {
      FlowRouter.go('/login');
    }
  }

  toggleSidebar() {
    const { sidebarToggled } = this.state;
    this.setState({ sidebarToggled: !sidebarToggled });
  }

  render() {
    const alertsConfig = {
      effect: 'jelly',
      position: 'bottom-right',
      timeout: 3000,
      html: true,
      onRouteClose: false,
      stack: true,
      offset: 0
    };

    return (
      <div id='dash-wrapper' className={this.state.sidebarToggled ? 'toggled' : null}>
        {SideNav()}
        <main id='dash-content-wrapper' className='main-content'>
          <button id='sidenav-toggle' className='btn btn-default'
                  onClick={this.toggleSidebar.bind(this)}>
            Menu
          </button>
          {this.props.content()}
        </main>
        <Alert {...alertsConfig}/>
      </div>
    );
  }
}

export default MainLayout;
