import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import _ from 'lodash';
import { FieldGroup } from '/client/modules/core/components';

class AppSettings extends Component {

  static propTypes = {
    settings: PropTypes.object,
    update: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = props.settings || {};

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStateChange(e) {
    this.setState(_.set(this.state, e.target.name, e.target.value));
  }

  handleSubmit(e) {
    e.preventDefault();
    const { update } = this.props;
    update(this.state);
  }

  render() {
    return (
      <Panel className='settings-page-form' header={<h3 className='text-center'>App Settings</h3>}>
        <form onSubmit={this.handleSubmit}>

          <Row className='settings-group-heading'>
            <h3>General</h3>
          </Row>
          <FieldGroup
            label='App Name'
            type='text'
            name='app.name'
            defaultValue={_.get(this.state, 'app.name')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Admin Email'
            type='text'
            name='app.adminEmail'
            defaultValue={_.get(this.state, 'app.adminEmail')}
            onChange={this.handleStateChange}
            info='(used for automated emails)'/>
          <FieldGroup
            label='Default App Image'
            type='text'
            name='docker.defaultApp'
            defaultValue={_.get(this.state, 'docker.defaultApp')}
            onChange={this.handleStateChange}
            info='(all stacks will launch this unless specified otherwise)'/>
          <FieldGroup
            label='MongoDB Image'
            type='text'
            name='docker.mongoImage'
            defaultValue={_.get(this.state, 'docker.mongoImage')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Load Balancer Endpoint'
            type='text'
            name='loadBalancerEndpoint'
            defaultValue={_.get(this.state, 'loadBalancerEndpoint')}
            onChange={this.handleStateChange}
            info='(where users will point their custom CNAME)'/>

          <Row className='settings-group-heading'>
            <h3>Rancher</h3>
          </Row>
          <FieldGroup
            label='Host URL'
            type='text'
            name='rancher.url'
            defaultValue={_.get(this.state, 'rancher.url')}
            onChange={this.handleStateChange}
            info='(Must include http:// or https:// and no trailing slash)'/>
          <FieldGroup
            label='Access Key'
            type='text'
            name='rancher.apiKey'
            defaultValue={_.get(this.state, 'rancher.apiKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Secret Key'
            type='text'
            name='rancher.apiSecret'
            defaultValue={_.get(this.state, 'rancher.apiSecret')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Default Environment'
            type='text'
            name='rancher.defaultEnv'
            defaultValue={_.get(this.state, 'rancher.defaultEnv')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Default Load Balancer ID'
            type='text'
            name='rancher.defaultBalancer'
            defaultValue={_.get(this.state, 'rancher.defaultBalancer')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Default Certificate ID'
            type='text'
            name='rancher.defaultCert'
            defaultValue={_.get(this.state, 'rancher.defaultCert')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Wildcard SSL Certificate</h3>
          </Row>
          <FieldGroup
            label='Wildcard Domain'
            type='text'
            name='ssl.wildcardDomain'
            defaultValue={_.get(this.state, 'ssl.wildcardDomain')}
            onChange={this.handleStateChange}
            info='(base domain that all stacks get a subdomain of if no domain is specified)'/>
          <FieldGroup
            label='Private Key'
            type='textarea'
            componentClass='textarea'
            rows={7}
            name='ssl.privateKey'
            defaultValue={_.get(this.state, 'ssl.privateKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Public Certificate'
            type='textarea'
            componentClass='textarea'
            rows={7}
            name='ssl.cert'
            defaultValue={_.get(this.state, 'ssl.cert')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Root Certificate'
            type='textarea'
            componentClass='textarea'
            rows={7}
            name='ssl.rootCert'
            defaultValue={_.get(this.state, 'ssl.rootCert')}
            onChange={this.handleStateChange}
            info='(optional)'/>

          <Row className='settings-group-heading'>
            <h3>AWS</h3>
          </Row>
          <FieldGroup
            label='Access Key'
            type='text'
            name='aws.accessKey'
            defaultValue={_.get(this.state, 'aws.accessKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Secret Key'
            type='text'
            name='aws.secretKey'
            defaultValue={_.get(this.state, 'aws.secretKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Region'
            type='text'
            name='aws.region'
            defaultValue={_.get(this.state, 'aws.region')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Stripe</h3>
          </Row>
          <FieldGroup
            label='Service'
            componentClass='select'
            name='stripe.mode'
            defaultValue={_.get(this.state, 'stripe.mode')}
            onChange={this.handleStateChange}>
            <option value=''>(Select One)</option>
            <option value='Test'>Test</option>
            <option value='Live'>Live</option>
          </FieldGroup>
          <FieldGroup
            label='Test - Publishable Key'
            type='text'
            name='stripe.test.publishableKey'
            defaultValue={_.get(this.state, 'stripe.test.publishableKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Test - Secret Key'
            type='text'
            name='stripe.test.secretKey'
            defaultValue={_.get(this.state, 'stripe.test.secretKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Live - Publishable Key'
            type='text'
            name='stripe.live.publishableKey'
            defaultValue={_.get(this.state, 'stripe.live.publishableKey')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Live - Secret Key'
            type='text'
            name='stripe.live.secretKey'
            defaultValue={_.get(this.state, 'stripe.live.secretKey')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Intercom</h3>
          </Row>
          <FieldGroup
            label='App ID'
            type='text'
            name='intercom.appId'
            defaultValue={_.get(this.state, 'intercom.appId')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='API Key'
            type='text'
            name='intercom.apiKey'
            defaultValue={_.get(this.state, 'intercom.apiKey')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Kadira</h3>
          </Row>
          <FieldGroup
            label='App ID'
            type='text'
            name='kadira.appId'
            defaultValue={_.get(this.state, 'kadira.appId')}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label='Secret'
            type='text'
            name='kadira.appSecret'
            defaultValue={_.get(this.state, 'kadira.appSecret')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Segment.io</h3>
          </Row>
          <FieldGroup
            label='API Key'
            type='text'
            name='segment.writeKey'
            defaultValue={_.get(this.state, 'segment.writeKey')}
            onChange={this.handleStateChange}/>

          <Row className='settings-group-heading'>
            <h3>Slack</h3>
          </Row>
          <FieldGroup
            label='Webhook URL'
            type='text'
            name='slack.webhookUrl'
            defaultValue={_.get(this.state, 'slack.webhookUrl')}
            onChange={this.handleStateChange}/>

          <Row>
            <div className='form-group'>
              <button type='submit' className='btn btn-primary pull-right'>Save</button>
            </div>
          </Row>

        </form>
      </Panel>
    );
  }
}

export default AppSettings;
