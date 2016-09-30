import React from 'react';
import moment from 'moment';
import { Row, Col, Panel } from 'react-bootstrap';
import LaddaButton from 'react-ladda';

class StackInfo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      stateColor: ''
    };
  }

  // detect where component is being used
  isStackPage() {
    const { FlowRouter } = this.props.context();
    return (FlowRouter.getRouteName() === 'stack_page');
  }

  // get the URL for the Rancher stack page
  getStackLink() {
    const { stack, settings } = this.props;
    const rancherHost = settings.rancherApiUrl;
    const rancherEnv = settings.rancherDefaultEnv;
    return `${rancherHost}/env/${rancherEnv}/apps/stacks/${stack.rancherId}`;
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

  componentDidMount() {
    this.setStateColor(this.props.stack);
  }

  componentWillReceiveProps() {
    this.setStateColor(this.props.stack);
  }

  deleteCert() {
    const { stack, deleteCert } = this.props;
    deleteCert(stack._id);
  }

  render() {
    const { stack } = this.props;

    return (
      <Row className='row'>
        <h1 className='text-center'>{stack.name}</h1>
        <div className='divider'></div>
        <Col sm={12} md={6}>
          <h3 className='text-center'>Stack detail</h3>
          <Panel>
            <Row>
              <Col sm={12}>
                <p><strong>Name:</strong> {stack.name}</p>
                <p><strong>UUID:</strong> {stack.uuid}</p>
                <p><strong>Created:</strong> {moment(stack.createdAt).format('LLL')}</p>
                <p><strong>State: </strong>
                  <span className={`${this.state.stateColor} text-capitalize`}>
                    {stack.state}
                  </span>
                </p>
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                <a href={this.getStackLink()} target='_blank'>
                  View stack in Rancher
                </a>
              </Col>
            </Row>
          </Panel>
        </Col>
        <Col sm={12} md={6}>
          <h3 className='text-center'>SSL Settings</h3>
          <Panel>
            <Row>
              <Col sm={12}>
                <p><strong>Default URL:</strong></p>
                <a href={stack.defaultUrl} target='_blank'>
                  <p>{stack.defaultUrl}</p>
                </a>
                <br />
                {stack.sslDomainName ?
                  <div>
                    <p><strong>Custom URL:</strong></p>
                    <a href='https://{stack.sslDomainName}' target='_blank'>
                      <p>https://{stack.sslDomainName}</p>
                    </a>
                  </div>
                  : null
                }
                {!this.isStackPage.bind(this)() && !!stack.sslRancherCertId ?
                  <LaddaButton
                    id='delete-cert'
                    className='btn btn-danger pull-right'
                    loading={this.state.submitted}
                    buttonStyle='slide-left'
                    onClick={this.deleteCert.bind(this)}>
                    Delete Custom Certificate
                  </LaddaButton>
                  : null
                }
              </Col>
            </Row>
            <Row>
              <Col sm={8}>
                {this.isStackPage.bind(this)() ?
                  <a href={`/stacks/${stack._id}/ssl`}>
                    Show SSL Settings
                  </a>
                  :
                  <a href={`/stacks/${stack._id}`}>
                    Show stack info
                  </a>
                }
              </Col>
            </Row>
          </Panel>
        </Col>
      </Row>
    );
  }
}

StackInfo.propTypes = {
  context: React.PropTypes.func.isRequired,
  stack: React.PropTypes.object.isRequired,
  settings: React.PropTypes.object.isRequired,
  deleteCert: React.PropTypes.func.isRequired
};

export default StackInfo;
