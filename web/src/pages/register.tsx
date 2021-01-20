import React from "react";
import { Button } from "@chakra-ui/button";
import { Form, Formik } from "formik";
import * as yup from "yup";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Heading } from "@chakra-ui/react";
import { MeDocument, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withApollo } from "../utils/withApollo";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("This field is required")
    .min(2, "Length must be greater than 2 ")
    .email("Invalid email"),
  username: yup
    .string()
    .required("This field is required")
    .min(2, "Length must be greater than 2 "),
  password: yup
    .string()
    .required("This field is required")
    .min(3, "Length must be greater than 3 "),
});

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [register, { loading }] = useRegisterMutation({
    update: (cache, { data }) => {
      cache.writeQuery({
        query: MeDocument,
        data: {
          __typename: "Query",
          me: data?.register.user,
        },
      });
    },
  });
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "", email: "" }}
        validationSchema={schema && null}
        onSubmit={async (values, actions) => {
          const { data } = await register({ variables: values });
          if (data?.register.errors) {
            actions.setErrors(toErrorMap(data.register.errors));
          } else if (data?.register.user) {
            await router.push("/");
          }
        }}
      >
        <Form>
          <Heading>Register</Heading>
          <Box mt="10px">
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="email"
            />
          </Box>
          <Box mt="10px">
            <InputField
              name="username"
              label="Username"
              placeholder="username"
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
          <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
            Register
          </Button>
        </Form>
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register);
