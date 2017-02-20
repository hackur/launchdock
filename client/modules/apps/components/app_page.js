import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { graphql } from 'react-apollo';
import TimeAgo from 'react-timeago';
import format from 'date-fns/format';
import appQuery from '../graphql/appQuery';


const AppPage = ({ data: { app, loading } }) => (
  <Grid>
    {!loading && <Helmet title={app.name} />}
    <Row>
      {!!loading ?
        'Loading...'
        :
        <Col md={8} mdOffset={2}>
          <Panel>
            <h2 className='text-center'>{app.name}</h2>
            <p>Created: {format(app.createdAt, 'MMMM D, YYYY h:mma')} (<TimeAgo date={app.createdAt}/>)</p>
            <ButtonToolbar className='pull-right'>
              <Button href='/apps'>Back</Button>
            </ButtonToolbar>
          </Panel>
        </Col>
      }
    </Row>
  </Grid>
);

AppPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default graphql(appQuery, {
  options: ({ _id }) => ({ variables: { _id } })
})(AppPage);
