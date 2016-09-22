import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

const Dashboard = ({ count }) => (
  <Grid>
    <Helmet title='Dashboard' />
    <Row>
      <Col md={2}>
        <Panel>
          <strong>Running stacks:</strong> {count}
        </Panel>
      </Col>
    </Row>
  </Grid>
);

Dashboard.propTypes = {
  count: PropTypes.number
};

export default Dashboard;
