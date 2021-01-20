import React from "react";
import { IconButton } from "@chakra-ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex } from "@chakra-ui/layout";
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";
import { gql } from "@urql/core";
import { ApolloCache } from "@apollo/client";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterMutation = (
  postId: number,
  value: number,
  newValue: number | undefined,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
      }
    `,
  });
  if (data && newValue) {
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment _ on Post {
          points
        }
      `,
      data: { points: newValue },
    });
  }
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [vote, { loading }] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        isLoading={loading}
        colorScheme={post.points > 0 ? "green" : null!}
        icon={<ChevronUpIcon />}
        aria-label="Updoot post"
        onClick={(e) => {
          vote({
            variables: { postId: post.id, value: 1 },
            update: (cache, { data }) =>
              updateAfterMutation(post.id, 1, data?.vote, cache),
          });
        }}
      />
      {post.points}
      <IconButton
        colorScheme={post.points < 0 ? "red" : null!}
        isLoading={loading}
        icon={<ChevronDownIcon />}
        aria-label="Downdoot post"
        onClick={(e) =>
          vote({
            variables: { postId: post.id, value: -1 },
            update: (cache, { data }) =>
              updateAfterMutation(post.id, -1, data?.vote, cache),
          })
        }
      />
    </Flex>
  );
};

export default UpdootSection;
