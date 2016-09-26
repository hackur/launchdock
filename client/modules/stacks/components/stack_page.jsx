import React from 'react';
import { Grid, Row, Col, Panel, Table } from 'react-bootstrap';
import Head from '/client/modules/core/components/head';
import StackInfo from './stack_info';
import ServiceListItem from './service_list_item';

class StackPage extends React.Component {

  render() {
    const { stack, services } = this.props;

    return (
      <Grid>
        <Head title={`Stack Info - ${stack._id}`}/>
        <StackInfo {...this.props} />
        <Row>
          <Col sm={12}>
            <h3 className='text-center'>Services</h3>
              <Panel>
                <Table responsive bordered>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>State</th>
                      <th>Service Name</th>
                      <th>Docker Image</th>
                      <th>View in Rancher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => {
                      return (
                        <ServiceListItem
                          key={service._id}
                          service={service}
                          {...this.props}
                        />
                      );
                    })}
                  </tbody>
                </Table>
              </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

StackPage.propTypes = {
  services: React.PropTypes.array.isRequired,
  settings: React.PropTypes.object.isRequired,
  stack: React.PropTypes.object.isRequired
};

export default StackPage;
