import { makeExecutableSchema } from 'graphql-tools';
import { loadSchema, getSchema } from 'graphql-loader';
import cors from 'cors';
import 'paginated-graphql';
import { createApolloServer } from 'meteor/apollo';
import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts';
import typeDefs from './schema';
import resolvers from './resolvers';

// Load all accounts related resolvers and type definitions into graphql-loader
initAccounts({});

// Load all resolvers and type definitions into graphql-loader
loadSchema({ typeDefs, resolvers });

// Gets all the resolvers and type definitions loaded in graphql-loader
const schema = makeExecutableSchema(getSchema());

createApolloServer({ schema }, {
  configServer(graphQLServer) {
    graphQLServer.use(cors());
  }
});
