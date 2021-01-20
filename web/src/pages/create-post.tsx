import React from "react";
import { Form, Formik } from "formik";
import { Box, Heading } from "@chakra-ui/react";
import InputField from "../components/InputField";
import { Button } from "@chakra-ui/button";
import * as yup from "yup";
import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const schema = yup.object().shape({
  title: yup.string().required("This field is required"),
  text: yup.string().required("This field is required"),
});

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
  const router = useRouter();
  const [createPost, { loading }] = useCreatePostMutation({
    update: (cache) => {
      cache.evict({ fieldName: "posts:{}" });
    },
  });

  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        validationSchema={schema}
        onSubmit={async (values) => {
          const { errors } = await createPost({ variables: { input: values } });
          if (!errors) {
            await router.push("/");
          }
        }}
      >
        <Form>
          <Heading>Create Post</Heading>
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
            <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
              Create post
            </Button>
          </Box>
        </Form>
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
