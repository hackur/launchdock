import React, { Component, PropTypes } from 'react';
import Alert from 'react-s-alert';
import Head from '../components/head';
import SideNav from '../containers/side_nav';

class MainLayout extends Component {

  constructor(props) {
    super(props);

    this.state = {
      sidebarToggled: false
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
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

    const { siteTitle } = this.props;

    return (
      <div id='dash-wrapper' className={this.state.sidebarToggled ? 'toggled' : null}>
        <Head title={siteTitle} />
        <SideNav/>
        <main id='dash-content-wrapper' className='main-content'>
          <button
            id='sidenav-toggle'
            className='btn btn-default'
            onClick={this.toggleSidebar}>
            Menu
          </button>
          {this.props.content()}
        </main>
        <Alert {...alertsConfig}/>
      </div>
    );
  }
}

MainLayout.propTypes = {
  content: PropTypes.func,
  siteTitle: PropTypes.string
};

export default MainLayout;
