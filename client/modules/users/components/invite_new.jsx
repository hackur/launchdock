import React from 'react';
import { Button, Modal } from 'react-bootstrap';

class InviteNew extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  sendInvite(e) {
    e.preventDefault();
    const { sendInvite } = this.props;
    const { email, role } = this.refs;
    sendInvite(email.value, role.value);
    this.setState({ showModal: false });
  }

  render() {
    const { Meteor, Roles } = this.props.context();

    return (
      <div>
        <Button
          bsStyle='primary'
          bsSize = 'large'
          onClick={this.toggleModal.bind(this)}>
          Send Invitation
        </Button>

        <Modal show={this.state.showModal} onHide={this.toggleModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Send Invitation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form id='send-invite-form' onSubmit={this.sendInvite.bind(this)}>
              <div className='form-group'>
                <label>Email address</label>
                <input ref='email' type='email' className='form-control' name='invite-user-email' />
              </div>
              <div className='form-group'>
                <label>Role</label>
                <select ref='role' name='invite-user-role' className='form-control'>
                  <option value=''>Select a role...</option>
                  <option value='admin'>Admin</option>
                  <option value='manager'>Manager</option>
                  <option value='customer'>Customer</option>
                </select>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.toggleModal.bind(this)}>Close</Button>
            <Button
              bsStyle='primary'
              onClick={this.sendInvite.bind(this)}>
              Send
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default InviteNew;
