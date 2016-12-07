import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel, Table, Button, ButtonToolbar } from 'react-bootstrap';
import format from 'date-fns/format';
import ApiKeyNew from '../containers/api_key_new';

class ApiKeysList extends React.Component {

  deleteKey(id) {
    const { deleteApiKey } = this.props;
    deleteApiKey(id);
  }

  render() {
    const { apiKeys, canDelete } = this.props;

    return (
      <Grid fluid={true}>
        <Helmet title='API' />
        <Row>
          <Col md={10} mdOffset={1}>
            <Panel>
              <h3>API Keys</h3>
              <hr/>
              <ApiKeyNew />
              <br/>
              {apiKeys.length > 0 ?
                <Table bordered responsive className='users-table'>
                  <thead>
                    <tr>
                      <th className='text-center'>Name</th>
                      <th className='text-center'>Access Key ID</th>
                      <th className='text-center'>Created</th>
                      <th className='text-center'>Owner User ID</th>
                      <th className='text-center'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => {
                      return (
                        <tr key={apiKey._id}>
                          <td className='text-center'>
                            {apiKey.name}
                          </td>
                          <td className='text-center'>
                            {apiKey.username}
                          </td>
                          <td className='text-center'>
                            {format(apiKey.createdAt, 'MMMM D, YYYY h:mma')}
                          </td>
                          <td className='text-center'>
                            {apiKey.createdBy}
                          </td>
                          <td>
                            <ButtonToolbar>
                              {canDelete(apiKey) ?
                                <Button
                                  bsStyle='danger'
                                  onClick={this.deleteKey.bind(this, apiKey._id)}>
                                  Delete
                                </Button>
                                : null }
                            </ButtonToolbar>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                :
                <h3 className='text-center'>No API keys yet.</h3>
              }
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

ApiKeysList.propTypes = {
  apiKeys: React.PropTypes.array.isRequired,
  canDelete: React.PropTypes.func.isRequired,
  deleteApiKey: React.PropTypes.func.isRequired,
  error: React.PropTypes.string
};

export default ApiKeysList;
