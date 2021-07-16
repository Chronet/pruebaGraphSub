import { ApolloServer } from "apollo-server-express";
import { schema } from "./schema";

export const serverApollo = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  subscriptions: `ws://localhost:3100/subscriptions`,
  // tracing: true
});
