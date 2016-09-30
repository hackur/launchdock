import React from 'react';
import { Glyphicon } from 'react-bootstrap';

class ServiceListItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      stateColor: ''
    };
  }

  setStateColor(item) {
    switch (item.state) {
      case 'Running':
        this.setState({ stateColor: 'green-text' });
        break;
      case 'Not running':
        this.setState({ stateColor: 'red-text' });
        break;
      case 'Starting':
        this.setState({ stateColor: 'orange-text' });
        break;
      case 'Redeploying':
        this.setState({ stateColor: 'orange-text' });
        break;
      case 'Partly running':
        this.setState({ stateColor: 'orange-text' });
        break;
      case 'Stopping':
        this.setState({ stateColor: 'red-text' });
        break;
      case 'Stopped':
        this.setState({ stateColor: 'red-text' });
        break;
      case 'Terminated':
        this.setState({ stateColor: 'text-muted' });
        break;
    }
  }

  // get Rancher URL for each service
  getServiceLink(service) {
    const { stack, settings } = this.props;
    const rancherHost = settings.rancherApiUrl;
    const rancherEnv = settings.rancherDefaultEnv;
    return `${rancherHost}/env/${rancherEnv}/apps/stacks/${stack.rancherId}/services/${service.rancherId}/`;
  }

  componentDidMount() {
    this.setStateColor(this.props.service);
  }

  componentWillReceiveProps() {
    this.setStateColor(this.props.service);
  }

  render() {
    const { service } = this.props;

    return (
      <tr>
        <td>{service.type}</td>
        <td>
          <span className={`${this.state.stateColor} text-capitalize`}>
            {service.state}
          </span>
        </td>
        <td>{service.name}</td>
        <td>{service.imageName}</td>
        <td>
          <div className="stack-service-links">
            <a href={this.getServiceLink(service)} target="_blank">
              <Glyphicon glyph='new-window' />
            </a>
          </div>
        </td>
      </tr>
    );
  }
}

export default ServiceListItem;
