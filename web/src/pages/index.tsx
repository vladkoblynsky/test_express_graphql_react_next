import React from "react";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { Button } from "@chakra-ui/button";
import { Box, Heading, Text, Flex } from "@chakra-ui/layout";
import UpdootSection from "../components/UpdootSection";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 5,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <Layout>
      <Flex mb={10}>
        <Heading>Posts</Heading>
      </Flex>
      {loading && !data && <div>Loading...</div>}
      {data?.posts?.posts?.map((post, idx) =>
        !post ? null : (
          <Flex p={5} shadow="md" borderWidth="1px" key={idx}>
            <UpdootSection post={post} />
            <Box flex={1}>
              <Heading fontSize="xl">
                <NextLink href={"/post/[id]"} as={`/post/${post.id}`}>
                  {post.title}
                </NextLink>
              </Heading>
              <Text mt={1}>
                posted by <em>{post.creator.username}</em>
              </Text>
              <Text mt={4}>{post.textSnippet}</Text>
              <EditDeletePostButtons id={post.id} creatorId={post.creatorId} />
            </Box>
          </Flex>
        )
      )}
      {data?.posts && data.posts.hasMore && (
        <Flex my={5} justifyContent="center">
          <Button
            isLoading={loading}
            onClick={(e) =>
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data?.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (
                //   previousQueryResult: any,
                //   { fetchMoreResult }: any
                // ) => {
                //   if (!fetchMoreResult) {
                //     return previousQueryResult;
                //   }
                //   return {
                //     __typename: "Query",
                //     posts: {
                //       __typename: "PaginatedPosts",
                //       hasMore: fetchMoreResult.posts.hasMore,
                //       posts: [
                //         ...previousQueryResult.posts.posts,
                //         ...fetchMoreResult.posts.posts,
                //       ],
                //     },
                //   };
                // },
              })
            }
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
