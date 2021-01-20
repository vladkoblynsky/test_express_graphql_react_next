import React from "react";
import { Button } from "@chakra-ui/button";
import { Form, Formik } from "formik";
import * as yup from "yup";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Heading } from "@chakra-ui/react";
import { MeDocument, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withApollo } from "../utils/withApollo";

const schema = yup.object().shape({
  usernameOrEmail: yup
    .string()
    .required("This field is required")
    .min(2, "Length must be greater than 2 "),
  password: yup
    .string()
    .required("This field is required")
    .min(3, "Length must be greater than 3 "),
});

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [login, { loading }] = useLoginMutation({
    update: (cache, { data }) => {
      cache.writeQuery({
        query: MeDocument,
        data: {
          __typename: "Query",
          me: data?.login.user,
        },
      });
      cache.evict({ fieldName: "posts:{}" });
    },
  });
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, actions) => {
          const { data } = await login({ variables: values });
          if (data?.login.errors) {
            actions.setErrors(toErrorMap(data.login.errors));
          } else if (data?.login.user) {
            if (typeof router.query.next === "string") {
              await router.push(router.query.next);
            } else {
              await router.push("/");
            }
          }
        }}
      >
        <Form>
          <Heading>Login</Heading>
          <Box mt="10px">
            <InputField
              name="usernameOrEmail"
              label="Username or email"
              placeholder="Username or email"
            />
          </Box>
          <Box mt="10px">
            <InputField
              name="password"
              label="Password"
              placeholder="password"
              type="password"
            />
          </Box>
          <NextLink href="/forgot-password">
            <Button variant="link">Forgot password?</Button>
          </NextLink>
          <Box>
            <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
              Login
            </Button>
          </Box>
        </Form>
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
