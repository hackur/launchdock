import React, { PropTypes } from 'react';

const CustomError = ({ error }) => (
  <div style={{ color: 'red', textAlign: 'center' }}>
    {error.message}
  </div>
);

CustomError.propTypes = {
  error: PropTypes.string.isRequired
};

export default CustomError;
