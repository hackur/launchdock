import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel, Table, ButtonToolbar, Button } from 'react-bootstrap';
import format from 'date-fns/format';
import { default as fromNow } from 'date-fns/distance_in_words_to_now';
import _ from 'lodash';

class JobsList extends React.Component {

  componentWillMount() {
    this.updateLimit = _.debounce(() => {
      const { FlowRouter } = this.props.context();
      const { limit } = this.refs;
      if (!limit.value) {
        FlowRouter.setQueryParams({ limit: null });
      } else {
        FlowRouter.setQueryParams({ limit: limit.value });
      }
    }, 300, { maxWait: 1000 });
  }

  handleDeleteJob(job, event) {
    const { deleteJob } = this.props;
    deleteJob(job, event.altKey);
  }

  renderNoJobs() {
    return (
      <div>
        <h4 className='text-center'>No jobs at this time</h4>
      </div>
    );
  }

  renderJobsTable(jobs) {
    const { canEdit } = this.props;

    return (
      <div>
        <div className='table-controls'>
          <div className='table-filter'>
            <h5>Quantity</h5>
            <input
              type='number'
              ref='limit'
              onChange={this.updateLimit.bind(this)}
              defaultValue={this.props.limit || 10}/>
          </div>
        </div>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Type</th>
              <th>Status</th>
              <th>Percent Done</th>
              {canEdit ? <th></th> : null}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              return (
                <tr key={job._id}>
                  <td>
                    {format(job.created, 'MMMM D, YYYY h:mma')}
                    <small> ({fromNow(job.created)} ago)</small>
                  </td>
                  <td>{job.type}</td>
                  <td>{job.status}</td>
                  <td>{job.progress.percent}%</td>
                  {canEdit ?
                    <td>
                      {job.status !== 'waiting' ?
                        <ButtonToolbar>
                          <Button
                            bsStyle='danger'
                            onClick={this.handleDeleteJob.bind(this, job)}>
                            Delete
                          </Button>
                        </ButtonToolbar>
                        : null
                      }
                    </td>
                    : null
                  }
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    const { jobs } = this.props;

    return (
      <Grid>
        <Helmet title='Jobs' />
        <Row>
          <Col sm={12}>
            <Panel>
              <h2 className='text-center'>Job Queue</h2>
              <hr/>
              {jobs.length === 0 ?
                  this.renderNoJobs()
                : this.renderJobsTable(jobs)}
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

JobsList.propTypes = {
  canEdit: React.PropTypes.bool.isRequired,
  context: React.PropTypes.func.isRequired,
  deleteJob: React.PropTypes.func.isRequired,
  jobs: React.PropTypes.array
};

export default JobsList;
