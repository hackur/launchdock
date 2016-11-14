import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

const Dashboard = ({ settings }) => (
  <Grid>
    <Helmet title='Dashboard' />
    <Row>
      <Col md={4}>
        <Panel>
          <div>
            <h3 style={{ textAlign: 'center' }}>Rancher Status</h3>
            <hr/>
            {settings.rancherConnected ?
              <div>
                <h5 style={{ color: 'green' }}>Connected</h5>
                <p>URL: <a href={settings.rancherApiUrl} target='_blank'>{settings.rancherApiUrl}</a></p>
                <p>API Key: {settings.rancherApiKey}</p>
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
