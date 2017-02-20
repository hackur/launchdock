import gql from 'graphql-tag';

export default gql`
  query apps {
    apps {
      id
      _id
      name
      image
      createdAt
    }
  }
`;
