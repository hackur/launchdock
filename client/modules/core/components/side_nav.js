import React from 'react';

const SideNav = () => (
  <div id="sidebar-wrapper">
    <ul className="sidebar-nav">
      <li className="sidebar-brand">
        <a href="/">
          <img id="logo-rocket" src="/logo/rocket.png" alt="logo-rocket" />
          <span id="logo-text">Launchdock</span>
        </a>
      </li>
      <li>
        <div className="sidebar-spacer"></div>
      </li>
      <li>
        <a  href="/">
          Dashboard
        </a>
      </li>
      <li>
        <a  href="/users">
          Users
        </a>
      </li>
      <li>
        <a href="/hosts">
          Hosts
        </a>
      </li>
      <li>
        <a href="/stacks">
          Stacks
        </a>
      </li>
      <li>
        <a  href="/settings">
          Settings
        </a>
      </li>
      <li>
        <div className="sidebar-spacer"></div>
      </li>
      <li>
        <a href="/logout">Logout</a>
      </li>
    </ul>
  </div>
);

export default SideNav;
