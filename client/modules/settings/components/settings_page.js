import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { FieldGroup } from '/client/modules/core/components';

class SettingsPage extends Component {

  static propTypes = {
    settings: PropTypes.object,
    update: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings
    };

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
        <Helmet title='Settings'/>
        <Row>
          <Col sm={12} md={6} mdOffset={3}>
            <Panel className='settings-page-form'>
              <h3 className='form-heading text-center'>Settings</h3>
              <form onSubmit={this.handleSubmit}>

                <Row className='settings-group-heading'>
                  <h3>General</h3>
                </Row>
                <FieldGroup
                  label='Site Title'
                  type='text'
                  name='siteTitle'
                  value={settings.siteTitle}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Admin Email'
                  type='text'
                  name='adminEmail'
                  value={settings.adminEmail}
                  onChange={this.handleStateChange}
                  info='(used for automated emails)'/>
                <FieldGroup
                  label='Mail URL'
                  type='text'
                  name='mailUrl'
                  value={settings.mailUrl}
                  onChange={this.handleStateChange}
                  info='(used for automated emails)'/>
                <FieldGroup
                  label='Default App Image'
                  type='text'
                  name='defaultAppImage'
                  value={settings.defaultAppImage}
                  onChange={this.handleStateChange}
                  info='(all stacks will launch this unless specified otherwise)'/>
                <FieldGroup
                  label='MongoDB Image'
                  type='text'
                  name='mongoImage'
                  value={settings.mongoImage}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Load Balancer Endpoint'
                  type='text'
                  name='loadBalancerEndpoint'
                  value={settings.loadBalancerEndpoint}
                  onChange={this.handleStateChange}
                  info='(where users will point their custom CNAME)'/>

                <Row className='settings-group-heading'>
                  <h3>Rancher</h3>
                </Row>
                <FieldGroup
                  label='Host URL'
                  type='text'
                  name='rancherApiUrl'
                  value={settings.rancherApiUrl}
                  onChange={this.handleStateChange}
                  info='(Must include http:// or https:// and no trailing slash)'/>
                <FieldGroup
                  label='Access Key'
                  type='text'
                  name='rancherApiKey'
                  value={settings.rancherApiKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Secret Key'
                  type='text'
                  name='rancherApiSecret'
                  value={settings.rancherApiSecret}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Default Environment'
                  type='text'
                  name='rancherDefaultEnv'
                  value={settings.rancherDefaultEnv}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Default Load Balancer ID'
                  type='text'
                  name='rancherDefaultBalancer'
                  value={settings.rancherDefaultBalancer}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Default Certificate ID'
                  type='text'
                  name='rancherDefaultCert'
                  value={settings.rancherDefaultCert}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Wildcard SSL Certificate</h3>
                </Row>
                <FieldGroup
                  label='Wildcard Domain'
                  type='text'
                  name='wildcardDomain'
                  value={settings.wildcardDomain}
                  onChange={this.handleStateChange}
                  info='(base domain that all stacks get a subdomain of if no domain is specified)'/>
                <FieldGroup
                  label='Private Key'
                  type='textarea'
                  componentClass='textarea'
                  rows={7}
                  name='sslPrivateKey'
                  value={settings.sslPrivateKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Public Certificate'
                  type='textarea'
                  componentClass='textarea'
                  rows={7}
                  name='sslCertificate'
                  value={settings.sslCertificate}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Root Certificate'
                  type='textarea'
                  componentClass='textarea'
                  rows={7}
                  name='sslRootCertificate'
                  value={settings.sslRootCertificate}
                  onChange={this.handleStateChange}
                  info='(optional)'/>

                <Row className='settings-group-heading'>
                  <h3>AWS</h3>
                </Row>
                <FieldGroup
                  label='Access Key'
                  type='text'
                  name='awsKey'
                  value={settings.awsKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Secret Key'
                  type='text'
                  name='awsSecret'
                  value={settings.awsSecret}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Region'
                  type='text'
                  name='awsRegion'
                  value={settings.awsRegion}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Stripe</h3>
                </Row>
                <FieldGroup
                  label='Service'
                  componentClass='select'
                  name='stripeMode'
                  value={settings.stripeMode}
                  onChange={this.handleStateChange}>
                  <option value=''>(Select One)</option>
                  <option value='Test'>Test</option>
                  <option value='Live'>Live</option>
                </FieldGroup>
                <FieldGroup
                  label='Test - Publishable Key'
                  type='text'
                  name='stripeTestPublishableKey'
                  value={settings.stripeTestPublishableKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Test - Secret Key'
                  type='text'
                  name='stripeTestSecretKey'
                  value={settings.stripeTestSecretKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Live - Publishable Key'
                  type='text'
                  name='stripeLivePublishableKey'
                  value={settings.stripeLivePublishableKey}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Live - Secret Key'
                  type='text'
                  name='stripeLiveSecretKey'
                  value={settings.stripeLiveSecretKey}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Intercom</h3>
                </Row>
                <FieldGroup
                  label='App ID'
                  type='text'
                  name='intercomAppId'
                  value={settings.intercomAppId}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='API Key'
                  type='text'
                  name='intercomApiKey'
                  value={settings.intercomApiKey}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Kadira</h3>
                </Row>
                <FieldGroup
                  label='App ID'
                  type='text'
                  name='kadiraAppId'
                  value={settings.kadiraAppId}
                  onChange={this.handleStateChange}/>
                <FieldGroup
                  label='Secret'
                  type='text'
                  name='kadiraAppSecret'
                  value={settings.kadiraAppSecret}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Segment.io</h3>
                </Row>
                <FieldGroup
                  label='API Key'
                  type='text'
                  name='segmentKey'
                  value={settings.segmentKey}
                  onChange={this.handleStateChange}/>

                <Row className='settings-group-heading'>
                  <h3>Slack</h3>
                </Row>
                <FieldGroup
                  label='Webhook URL'
                  type='text'
                  name='slackWebhookUrl'
                  value={settings.slackWebhookUrl}
                  onChange={this.handleStateChange}/>

                <Row>
                  <div className='form-group'>
                    <button type='submit' className='btn btn-primary pull-right'>Save</button>
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

export default SettingsPage;
