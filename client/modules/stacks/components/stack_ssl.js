import React from 'react';
import Blaze from 'meteor/gadicc:blaze-react-component';
import StackInfo from './stack_info';


class StackSSL extends React.Component {

  render() {
    return (
      <div className='container'>
        <StackInfo {...this.props} />
        <Blaze template='stack_ssl' />
      </div>
    );
  }

}

export default StackSSL;
