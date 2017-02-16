import React, { Component, PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { FieldGroup } from '/client/modules/core/components';

class InviteNew extends Component {

  static propTypes = {
    sendInvite: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleStateChange(e) {
    this.setState({ error: null });
    const t = e.target;
    this.setState(_.set(this.state, t.name, t.type === 'checkbox' ? t.checked : t.value));
  }

  handleSubmit(e) {
    e.preventDefault();

    const { sendInvite } = this.props;
    const { email, role, api, appName } = this.state;

    if (!email) {
      return this.setState({ error: 'Please choose an email.' });
    }

    if (!role) {
      return this.setState({ error: 'Please choose a role.' });
    }

    sendInvite({ email, role, api, appName });

    this.setState({ showModal: false });
  }

  render() {
    const { error, role } = this.state;

    return (
      <div>
        <Button
          bsStyle='primary'
          bsSize = 'large'
          onClick={this.toggleModal}>
          Send Invitation
        </Button>

        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Send Invitation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form id='send-invite-form' onSubmit={this.handleSubmit}>
              {error && <div className='error text-center'>error</div>}
              <FieldGroup
                label='Email Address'
                type='text'
                name='email'
                defaultValue={_.get(this.state, 'email')}
                onChange={this.handleStateChange}/>
              <div className='form-group'>
                <label>Role</label>
                <select ref='role' name='role' className='form-control' onChange={this.handleStateChange}>
                  <option value=''>Select a role...</option>
                  <option value='admin'>Admin</option>
                  <option value='manager'>Manager</option>
                  <option value='customer'>Customer</option>
                </select>
              </div>
              {role === 'customer' &&
                <div>
                  <div className='form-group'>
                    <label>API Invite</label><br/>
                    <input name='api' type='checkbox' onChange={this.handleStateChange}/>
                  </div>
                  <FieldGroup
                    label='App Name (optional)'
                    type='text'
                    name='appName'
                    defaultValue={_.get(this.state, 'appName')}
                    onChange={this.handleStateChange}/>
                </div>
              }
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.toggleModal}>Close</Button>
            <Button
              bsStyle='primary'
              onClick={this.handleSubmit}>
              Send
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default InviteNew;
