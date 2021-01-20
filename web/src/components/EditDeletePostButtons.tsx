import React from "react";
import { Flex } from "@chakra-ui/layout";
import NextLink from "next/link";
import { IconButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const router = useRouter();
  const { data } = useMeQuery({ skip: isServer() });
  const [deletePost] = useDeletePostMutation();
  if (data?.me?.id !== creatorId) return null;
  return (
    <Flex float="right">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton mr={2} icon={<EditIcon />} aria-label="edit post" />
      </NextLink>

      <IconButton
        colorScheme="red"
        icon={<DeleteIcon />}
        aria-label="delete post"
        onClick={async () => {
          await deletePost({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: `Post:${id}` });
            },
          });
          await router.push("/");
        }}
      />
    </Flex>
  );
};

export default EditDeletePostButtons;
