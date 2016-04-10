import React from 'react';

const Dashboard = ({ count }) => (
  <div className="row">
    <div className="col-sm-12 col-md-2">
      <div className="panel panel-default">
        <div className="panel-body text-center">
          <strong>Running stacks:</strong> {count}
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
