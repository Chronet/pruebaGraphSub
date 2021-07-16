import "./LoadEnv"; // Must be the first import
import app from "@server";
import logger from "@shared/Logger";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { schema } from "./graphQl/schema";

const pubsub = new PubSub();
const server = createServer(app);

server.listen(3100, () => {
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: server,
      path: "/subscriptions",
    }
  );
});

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info("Express server started on port: " + port);
});
