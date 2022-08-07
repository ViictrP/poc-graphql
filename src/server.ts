import 'reflect-metadata';
import path from 'path';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';
import { UserResolver } from './resolvers/userResolver';

const main = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
  });

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });

  const { url } = await server.listen();

  console.log(`Server running on ${url}`);
};

main();
