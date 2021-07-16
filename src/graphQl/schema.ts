import { SchemaComposer } from "graphql-compose";
import { PubSub } from "apollo-server-express";
import { find, filter } from "lodash";

const schemaComposer = new SchemaComposer();

const authors = [
  { id: 1, firstName: "Tom", lastName: "Coleman" },
  { id: 2, firstName: "Sashko", lastName: "Stubailo" },
  { id: 3, firstName: "Mikhail", lastName: "Novikov" },
];

const posts = [
  { id: 1, authorId: 1, title: "Introduction to GraphQL", votes: 2 },
  { id: 2, authorId: 2, title: "Welcome to Apollo", votes: 3 },
  { id: 3, authorId: 2, title: "Advanced GraphQL", votes: 1 },
  { id: 4, authorId: 3, title: "Launchpad is Cool", votes: 7 },
];

const AuthorTC = schemaComposer.createObjectTC({
  name: "Author",
  fields: {
    id: "Int!",
    firstName: "String",
    lastName: "String",
  },
});

const PostTC = schemaComposer.createObjectTC({
  name: "Post",
  fields: {
    id: "Int!",
    title: "String",
    votes: "Int",
    authorId: "Int",
  },
});

PostTC.addFields({
  author: {
    type: AuthorTC,
    resolve: (post: any) => find(authors, { id: post.authorId }),
  },
});

AuthorTC.addFields({
  posts: {
    type: [PostTC],
    resolve: (author: any) => filter(posts, { authorId: author.id }),
  },
  postCount: {
    type: "Int",
    description: "Number of Posts written by Author",
    resolve: (author: any) => filter(posts, { authorId: author.id }).length,
  },
});

schemaComposer.Query.addFields({
  posts: {
    type: "[Post]",
    resolve: () => posts,
  },
  author: {
    type: "Author",
    args: { id: "Int!" },
    resolve: (_, { id }) => find(authors, { id }),
  },
});

const pubsub = new PubSub();
schemaComposer.Mutation.addFields({
  upvotePost: {
    type: "Post",
    args: {
      postId: "Int!",
    },
    resolve: (_, { postId }) => {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      pubsub.publish("updatePost", { updatePost: post });
      return post;
    },
  },
});

schemaComposer.Subscription.addFields({
  updatePost: {
    type: "Post",
    resolve: (payload: any) => {
      console.log(payload);
      return payload.updatePost;
    },
    subscribe: () => pubsub.asyncIterator("updatePost"),
  },
});

export const schema = schemaComposer.buildSchema();
