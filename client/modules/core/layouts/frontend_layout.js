import React, { PropTypes } from 'react';
import { Grid } from 'react-bootstrap';
import Head from '../components/head';

const styles = {
  marginTop: '5%'
};

const FrontLayout = ({ content, siteTitle }) => (
  <Grid style={styles}>
    <Head title={siteTitle} />
    {content()}
  </Grid>
);

FrontLayout.propTypes = {
  content: PropTypes.func,
  siteTitle: PropTypes.string
};

export default FrontLayout;
