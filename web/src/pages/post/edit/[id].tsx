import React from "react";
import { useRouter } from "next/router";
import { Progress } from "@chakra-ui/progress";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { useIsAuth } from "../../../utils/useIsAuth";
import { Box, Heading } from "@chakra-ui/react";
import InputField from "../../../components/InputField";
import { Button } from "@chakra-ui/button";
import { withApollo } from "../../../utils/withApollo";

const schema = yup.object().shape({
  id: yup.number().required(),
  title: yup.string().required("This field is required"),
  text: yup.string().required("This field is required"),
});

interface IProps {}

const PostEdit: React.FC<IProps> = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  useIsAuth();

  return (
    <Layout>
      {loading && !data && <Progress size="xs" isIndeterminate />}
      {data?.post && (
        <Formik
          initialValues={{
            title: data.post.title,
            text: data.post.text,
            id: data.post.id,
          }}
          enableReinitialize={true}
          validationSchema={schema}
          onSubmit={async (values) => {
            const { errors, data } = await updatePost({ variables: values });
            if (!errors) {
              await router.push(`/post/${data?.updatePost?.id}`);
            }
          }}
        >
          <Form>
            <Heading>Edit Post</Heading>
            <Box mt="10px">
              <InputField name="title" label="Title" placeholder="Title" />
            </Box>
            <Box mt="10px">
              <InputField
                textarea
                name="text"
                label="Body"
                placeholder="body..."
              />
            </Box>
            <Box>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={loading}
                type="submit"
              >
                Edit post
              </Button>
            </Box>
          </Form>
        </Formik>
      )}
      {!loading && !data?.post && <div>Could not find post</div>}
    </Layout>
  );
};

export default withApollo({ ssr: false })(PostEdit);
