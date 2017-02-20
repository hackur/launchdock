import gql from 'graphql-tag';

export default gql`
  query app ($_id: ID!) {
    app (_id: $_id) {
      id
      _id
      name
      image
      createdAt
    }
  }
`;
