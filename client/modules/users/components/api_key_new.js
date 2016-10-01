import React from 'react';
import { Button, Modal } from 'react-bootstrap';

class ApiKeyNew extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      error: null,
      name: null,
      username: null,
      secret: null
    };
  }

  toggleModal() {
    this.createKey();
    this.setState({ showModal: !this.state.showModal });
  }

  createKey() {
    const { createApiKey } = this.props;
    createApiKey((username, secret) => {
      this.setState({ username, secret });
    });
  }

  saveKey(e) {
    e.preventDefault();
    const name = this.refs.name.value;
    const { username, secret } = this.state;
    const { saveApiKey } = this.props;
    saveApiKey({ name, username, secret }, (err, res) => {
      if (!err) {
        this.toggleModal();
      }
    });
  }

  render() {
    const { name, description, username, secret } = this.state;
    const { canCreate, error } = this.props;

    return (
      <div>
        <Button
          bsStyle='primary'
          onClick={this.toggleModal.bind(this)}>
          Create New API Key
        </Button>

        <Modal show={this.state.showModal} onHide={this.toggleModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>New API Key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form id='create-api-key' onSubmit={this.saveKey.bind(this)}>
              {error ? <div className='error text-center'>{error}</div> : null}
              <div className='form-group'>
                <label>Name</label>
                <input
                  ref='name'
                  type='text'
                  className='form-control'/>
                <div className='field-helper-text'>
                  (choose a name to remember where this key is used)
                </div>
              </div>
              <label>Access Key ID</label>
              <div>{username}</div>
              <label>Access Key Secret</label>
              <div>{secret}</div>
              <p className='api-key-explanation'>
                This is the last time these API credentials will be visible for you to copy.
                Please copy and save them somewhere before closing this dialog.
                You will need to generate new keys if you lose these.
              </p>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.toggleModal.bind(this)}>Cancel</Button>
            <Button
              bsStyle='primary'
              onClick={this.saveKey.bind(this)}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ApiKeyNew.propTypes = {
  canCreate: React.PropTypes.bool.isRequired,
  createApiKey: React.PropTypes.func.isRequired,
  saveApiKey: React.PropTypes.func.isRequired
};

export default ApiKeyNew;
