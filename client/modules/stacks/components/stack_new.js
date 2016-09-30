import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import LaddaButton from 'react-ladda';

class StackNew extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      submitted: false
    };
  }

  createStack(e) {
    e.preventDefault();

    this.setState({
      submitted: true
    });

    const { create } = this.props;
    const { name, appImage, domainName } = this.refs;

    const options = {
      name: name.value,
      appImage: appImage.value,
      domainName: domainName.value
    };

    create(options);
  }

  render() {
    const { context, error } = this.props;

    return (
      <Grid>
        <Row>
          <Col sm={6} smOffset={3}>
            <Panel>
              <form className='new-stack' onSubmit={this.createStack.bind(this)}>
                <h3 className='text-center'>Create New Stack</h3>
                {error ? <p style={{ color: 'red' }}>{error}</p> : null}
                <div className='form-group'>
                  <label className='control-label'>Name</label>
                  <input type='text' name='name' ref='name' className='form-control'/>
                </div>
                <div className='form-group'>
                  <label className='control-label'>App Image</label>
                  <input type='text' name='appImage' ref='appImage' className='form-control'/>
                </div>
                <div className='form-group'>
                  <label className='control-label'>Domain name</label>
                  <input type='text' name='domainName' ref='domainName' className='form-control'/>
                </div>
                <a href='/stacks' className='btn btn-default'>Cancel</a>
                <div className='pull-right'>
                  <LaddaButton
                    className='btn btn-primary'
                    loading={this.state.submitted}
                    buttonStyle='slide-left'>
                    Do it!
                  </LaddaButton>
                </div>
              </form>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default StackNew;
