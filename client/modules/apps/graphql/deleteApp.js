import gql from 'graphql-tag';

export default gql`
  mutation deleteApp($name: String!) {
    deleteApp(name: $name) {
      success
    }
  }
`;
