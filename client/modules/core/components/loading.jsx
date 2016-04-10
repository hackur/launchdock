import React from 'react';
import GridLoader from 'halogen/GridLoader';
// http://madscript.com/halogen

const Loading = () => (
  <div className='loader-wrapper'>
    <GridLoader color='#666'/>
  </div>
);

export default Loading;
