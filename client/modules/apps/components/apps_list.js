import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import format from 'date-fns/format';
import { graphql, compose } from 'react-apollo';
import { Grid, Row, Col, Panel, Table, Button, ButtonToolbar } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import AppNew from './app_new';
import appsQuery from '../graphql/appsQuery';
import deleteApp from '../graphql/deleteApp';


const AppsList = ({ data: { apps }, isAdmin, handleDelete }) => (
  <Grid>
    <Helmet title='Apps' />
    <Row>
      <Col sm={12}>
        <Panel>
          <h2 className='text-center'>Apps</h2>
          <hr/>
          {isAdmin && <AppNew/>}
          {apps && apps.length > 0 ?
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Docker Image</th>
                  <th>Created</th>
                  {isAdmin && <th/>}
                </tr>
              </thead>
              <tbody>
                {apps.map((app, i) => (
                  <tr key={i}>
                    <td><a href={`apps/${app._id}`}>{app.name}</a></td>
                    <td>{app.image || '<custom build>'}</td>
                    <td>{format(app.createdAt, 'MMMM D, YYYY h:mma')} (<TimeAgo date={app.createdAt}/>)</td>
                    {isAdmin &&
                      <td>
                        <ButtonToolbar>
                          <Button
                            bsStyle='danger'
                            onClick={() => handleDelete(app.name)}>
                            Delete
                          </Button>
                        </ButtonToolbar>
                      </td>}
                  </tr>
                ))}
              </tbody>
            </Table>
            : <h4 className='text-center'>No apps found</h4>}
        </Panel>
      </Col>
    </Row>
  </Grid>
);

AppsList.propTypes = {
  data: PropTypes.object,
  handleDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default compose(
  graphql(appsQuery),
  graphql(deleteApp, {
    props: ({ mutate }) => ({
      handleDelete: (name) => mutate({
        variables: { name },
        refetchQueries: [{
          query: appsQuery
        }]
      })
    })
  })
)(AppsList);
