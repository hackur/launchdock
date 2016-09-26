import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col } from 'react-bootstrap';
import { Accounts } from 'meteor/jeremy:react-accounts-ui';

const Login = () => (
  <Grid>
    <Helmet title='Login' />
    <Row>
      <Col md={6} mdOffset={3}>
        <Accounts.UI.LoginForm />
      </Col>
    </Row>
  </Grid>
);

export default Login;
