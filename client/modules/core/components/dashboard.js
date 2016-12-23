import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

const Dashboard = ({ rancher }) => (
  <Grid>
    <Helmet title='Dashboard' />
    <Row>
      <Col md={4}>
        <Panel>
          <div>
            <h3 style={{ textAlign: 'center' }}>Rancher Status</h3>
            <hr/>
            {rancher.connected ?
              <div>
                <h5 style={{ color: 'green' }}>Connected</h5>
                <p>URL: <a href={rancher.url} target='_blank'>{rancher.url}</a></p>
                <p>API Key: {rancher.apiKey}</p>
                <p>API Secret: ***********</p>
              </div>
              :
              <div>
                <h5 style={{ color: 'red' }}>Not Connected</h5>
                <a href='/settings'>Go to settings</a>
              </div>}
          </div>
        </Panel>
      </Col>
    </Row>
  </Grid>
);

Dashboard.propTypes = {
  settings: PropTypes.object
};

export default Dashboard;
