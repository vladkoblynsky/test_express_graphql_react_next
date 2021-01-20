import {
  dedupExchange,
  Exchange,
  fetchExchange,
  gql,
  stringifyVariables,
} from "@urql/core";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
  ChangePasswordMutation,
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import { tap, pipe } from "wonka";
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => ($ops) => {
  return pipe(
    forward($ops),
    tap(async ({ error }) => {
      if (error) {
        if (error.message.includes("not authenticated")) {
          await Router.replace("/login");
        }
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) return undefined;
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
};

export function createClientUrql(ssrExchange: any, ctx: any) {
  let cookie = "";
  if (isServer()) {
    cookie = ctx.req.headers.cookie;
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (result, args, cache) => {
              const { id } = args as DeletePostMutationVariables;
              cache.invalidate({ __typename: "Post", id });
            },
            vote: (_result, args, cache) => {
              const { postId } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                  }
                `,
                { id: postId }
              );
              if (data) {
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                    }
                  `,
                  { id: postId, points: _result.vote } as any
                );
              }
            },
            createPost: (_result, _, cache) => {
              invalidateAllPosts(cache);
            },
            changePassword: (_result, _, cache) => {
              betterUpdateQuery<ChangePasswordMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.changePassword.errors) {
                    return query;
                  } else {
                    return {
                      me: result.changePassword.user,
                    };
                  }
                }
              );
            },
            logout: (_result, _, cache) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
              invalidateAllPosts(cache);
            },
            login: (_result, _, cache) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPosts(cache);
            },

            register: (_result, _, cache) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
}
