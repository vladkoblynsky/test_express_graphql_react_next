import { ApolloClient, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";
import { isServer } from "./isServer";
import createWithApollo from "./createWithApollo";

const createClient = (ctx: NextPageContext | undefined) =>
  new ApolloClient({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
    headers: {
      cookie: isServer() ? ctx?.req?.headers.cookie || "" : "",
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge: (
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts => {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
