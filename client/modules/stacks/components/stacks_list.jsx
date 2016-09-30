import React from 'react';
import { Row, Col, Panel } from 'react-bootstrap';
import Helmet from 'react-helmet';
import moment from 'moment';
import Blaze from 'meteor/gadicc:blaze-react-component';

class StacksList extends React.Component {

  render() {
    const settings = {
      collection: 'stacks-list',
      rowsPerPage: 20,
      showFilter: true,
      fields: [
        { key: 'defaultUrl', label: 'URL', tmpl: Template.stacks_list_url, sortable: false},
        { key: 'name', label: 'Name'},
        { key: 'state', label: 'State'},
        { key: 'createdAt', label: 'Created', sort: 'descending',
          fn: val => `${moment(val).format('LLL')} (${moment(val).fromNow()})`
        },
        { key: 'actions', label: 'Actions', tmpl: Template.stacks_list_actions, sortable: false }
      ]
    };

    return (
      <Row>
        <Helmet title='Stacks'/>
        <Col sm={10} smOffset={1}>
          <Panel>
            <a href='/stacks/new'>
              <button className='btn btn-primary'>
                Launch a New Stack
              </button>
            </a>
            {this.props.stacks.length > 0 ?
              <Blaze template='reactiveTable' class='table table-bordered' settings={settings} />
              :
              <h3 className='text-center'>No stacks running at this time.</h3>
            }
          </Panel>
        </Col>
      </Row>
    );
  }
}

StacksList.propTypes = {
  stacks: React.PropTypes.array
};

export default StacksList;
