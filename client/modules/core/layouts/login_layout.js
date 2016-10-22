import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

const LoginLayout = ({ content }) => (
  <Grid>
    <Row>
      <Col md={6} mdOffset={3}>
        {content()}
      </Col>
    </Row>
  </Grid>
);

export default LoginLayout;
