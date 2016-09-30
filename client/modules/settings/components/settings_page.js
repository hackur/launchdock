import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import TextArea from 'react-textarea-autosize';

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings
    };
  }

  handleStateChange(e) {
    const { settings } = this.state;

    const fieldState = {};
    fieldState[e.target.name] = e.target.value;

    const newState = Object.assign(settings, fieldState);

    this.setState(newState);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { update } = this.props;
    const { settings } = this.state;
    update(settings);
  }

  render() {
    const { settings } = this.state;

    return (
      <Grid className='settings-page'>
        <Helmet title='Settings' />
        <Row>
          <Col sm={12} md={6} mdOffset={3}>
            <Panel className='settings-page-form'>
              <h3 className='form-heading text-center'>Settings</h3>
              <form onSubmit={this.handleSubmit.bind(this)}>
                <Row className='settings-group-heading'><h3>General</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Site Title</span>
                  </label>
                  <input
                    type='text'
                    name='siteTitle'
                    className='form-control'
                    value={settings.siteTitle}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Admin Email</span>
                  </label>
                  <input
                    type='text'
                    name='adminEmail'
                    className='form-control'
                    value={settings.adminEmail}
                    onChange={this.handleStateChange.bind(this)} />
                  <div className='info-text'>(used for automated emails)</div>
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Default App Image</span>
                  </label>
                  <input
                    type='text'
                    name='defaultAppImage'
                    className='form-control'
                    value={settings.defaultAppImage}
                    onChange={this.handleStateChange.bind(this)} />
                  <div className='info-text'>
                    (all stacks will launch this unless specified otherwise)
                  </div>
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>MongoDB Image</span>
                  </label>
                  <input
                    type='text'
                    name='mongoImage'
                    className='form-control'
                    value={settings.mongoImage}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Load Balancer Endpoint</span>
                  </label>
                  <input
                    type='text'
                    name='loadBalancerEndpoint'
                    className='form-control'
                    value={settings.loadBalancerEndpoint}
                    onChange={this.handleStateChange.bind(this)} />
                  <div className='info-text'>(where users will point their custom CNAME)</div>
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Default Wildcard Domain</span>
                  </label>
                  <input
                    type='text'
                    name='wildcardDomain'
                    className='form-control'
                    value={settings.wildcardDomain}
                    onChange={this.handleStateChange.bind(this)} />
                  <div className='info-text'>
                    (base domain that all stacks get a subdomain of if no domain is specified)
                  </div>
                </div>

                <Row className='settings-group-heading'><h3>Rancher</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Host URL</span>
                  </label>
                  <input
                    type='text'
                    name='rancherApiUrl'
                    className='form-control'
                    value={settings.rancherApiUrl}
                    onChange={this.handleStateChange.bind(this)} />
                  <div className="info-text">
                    (Must include http:// or https:// and no trailing slash)
                  </div>
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Access Key</span>
                  </label>
                  <input
                    type='text'
                    name='rancherApiKey'
                    className='form-control'
                    value={settings.rancherApiKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Secret Key</span>
                  </label>
                  <input
                    type='text'
                    name='rancherApiSecret'
                    className='form-control'
                    value={settings.rancherApiSecret}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Default Environment</span>
                  </label>
                  <input
                    type='text'
                    name='rancherDefaultEnv'
                    className='form-control'
                    value={settings.rancherDefaultEnv}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Default Load Balancer ID</span>
                  </label>
                  <input
                    type='text'
                    name='rancherDefaultBalancer'
                    className='form-control'
                    value={settings.rancherDefaultBalancer}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Default Certificate ID</span>
                  </label>
                  <input
                    type='text'
                    name='rancherDefaultCert'
                    className='form-control'
                    value={settings.rancherDefaultCert}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>SSL</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Private Key</span>
                  </label>
                  <TextArea
                    rows={6}
                    type='text'
                    name='sslPrivateKey'
                    className='form-control'
                    value={settings.sslPrivateKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Public Certificate</span>
                  </label>
                  <TextArea
                    rows={6}
                    name='sslCertificate'
                    className='form-control'
                    value={settings.sslCertificate}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Root Certificate</span>
                  </label>
                  <TextArea
                    rows={6}
                    name='sslRootCertificate'
                    className='form-control'
                    value={settings.sslRootCertificate}
                    onChange={this.handleStateChange.bind(this)} />
                    <div className="info-text">(optional)</div>
                </div>

                <Row className='settings-group-heading'><h3>AWS</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Access Key</span>
                  </label>
                  <input
                    type='text'
                    name='awsKey'
                    className='form-control'
                    value={settings.awsKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Secret Key</span>
                  </label>
                  <input
                    type='text'
                    name='awsSecret'
                    className='form-control'
                    value={settings.awsSecret}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Region</span>
                  </label>
                  <input
                    type='text'
                    name='awsRegion'
                    className='form-control'
                    value={settings.awsRegion}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>Stripe</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Mode</span>
                  </label>
                  <select
                    name='stripeMode'
                    value={settings.stripeMode}
                    onChange={this.handleStateChange.bind(this)}
                    className='form-control'>
                    <option value=''>(Select One)</option>
                    <option value='Test'>Test</option>
                    <option value='Live'>Live</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Test - Publishable Key</span>
                  </label>
                  <input
                    type='text'
                    name='stripeTestPublishableKey'
                    className='form-control'
                    value={settings.stripeTestPublishableKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Test - Secret Key</span>
                  </label>
                  <input
                    type='text'
                    name='stripeTestSecretKey'
                    className='form-control'
                    value={settings.stripeTestSecretKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Live - Publishable Key</span>
                  </label>
                  <input
                    type='text'
                    name='stripeLivePublishableKey'
                    className='form-control'
                    value={settings.stripeLivePublishableKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Live - Secret Key</span>
                  </label>
                  <input
                    type='text'
                    name='stripeLiveSecretKey'
                    className='form-control'
                    value={settings.stripeLiveSecretKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>Intercom</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>App ID</span>
                  </label>
                  <input
                    type='text'
                    name='intercomAppId'
                    className='form-control'
                    value={settings.intercomAppId}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>API Key</span>
                  </label>
                  <input
                    type='text'
                    name='intercomApiKey'
                    className='form-control'
                    value={settings.intercomApiKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>Kadira</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>App ID</span>
                  </label>
                  <input
                    type='text'
                    name='kadiraAppId'
                    className='form-control'
                    value={settings.kadiraAppId}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Secret</span>
                  </label>
                  <input
                    type='text'
                    name='kadiraAppSecret'
                    className='form-control'
                    value={settings.kadiraAppSecret}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>Segment.io</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>API Key</span>
                  </label>
                  <input
                    type='text'
                    name='segmentKey'
                    className='form-control'
                    value={settings.segmentKey}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row className='settings-group-heading'><h3>Slack</h3></Row>

                <div className='form-group'>
                  <label className='control-label'>
                    <span>Webhook URL</span>
                  </label>
                  <input
                    type='text'
                    name='slackWebhookUrl'
                    className='form-control'
                    value={settings.slackWebhookUrl}
                    onChange={this.handleStateChange.bind(this)} />
                </div>

                <Row>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                  </div>
                </Row>

              </form>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

SettingsPage.propTypes = {
  settings: React.PropTypes.object,
  update: React.PropTypes.func.isRequired
};

export default SettingsPage;
