import React from "react";
import { useRouter } from "next/router";
import { usePostQuery } from "../../generated/graphql";
import Layout from "../../components/Layout";
import { Box, Heading } from "@chakra-ui/layout";
import { Progress } from "@chakra-ui/progress";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { withApollo } from "../../utils/withApollo";

interface IProps {}

const Post: React.FC<IProps> = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });

  return (
    <Layout>
      {loading && !data && <Progress size="xs" isIndeterminate />}
      {data?.post && (
        <>
          <Heading>{data.post.title}</Heading>
          <Box>{data.post.text}</Box>
          <EditDeletePostButtons
            id={data.post.id}
            creatorId={data.post.creatorId}
          />
        </>
      )}
      {!loading && !data?.post && <div>Could not find post</div>}
    </Layout>
  );
};

export default withApollo({ ssr: false })(Post);
