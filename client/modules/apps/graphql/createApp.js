import gql from 'graphql-tag';

export default gql`
  mutation createApp($name: String!, $image: String) {
    createApp(name: $name, image: $image) {
      _id
    }
  }
`;
