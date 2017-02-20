import React, { Component, PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { graphql } from 'react-apollo';
import { FieldGroup } from '/client/modules/core/components/ui';
import appsQuery from '../graphql/appsQuery';
import createApp from '../graphql/createApp';

class AppNew extends Component {

  static propTypes = {
    submit: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      options: {},
      showModal: false
    };

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  handleStateChange(e) {
    const { options } = this.state;
    options[e.target.name] = e.target.value;
    this.setState({ options });
  }

  handleSubmit(e) {
    e.preventDefault();

    const { submit } = this.props;
    const { options } = this.state;

    submit(options).then((res) => {
      if (!res.errors) {
        this.setState({
          showModal: false,
          options: {}
        });
      } else {
        this.setState({ errors: res.errors });
      }
    });
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  render() {
    const { options } = this.state;

    return (
      <div>
        <Button
          bsStyle='primary'
          style={{ marginBottom: '1em' }}
          onClick={this.toggleModal}>
          Add App
        </Button>

        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>New App</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              <FieldGroup
                label='Name'
                type='text'
                name='name'
                defaultValue={options.name}
                onChange={this.handleStateChange}/>
              <FieldGroup
                label='Docker Image (optional)'
                type='text'
                name='image'
                defaultValue={options.image}
                onChange={this.handleStateChange}/>
              <Button bsStyle='primary' type='submit'>
                Create
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default graphql(createApp, {
  props: ({ mutate }) => ({
    submit: ({ name, image }) => mutate({
      variables: { name, image },
      refetchQueries: [{
        query: appsQuery
      }]
    })
  })
})(AppNew);
