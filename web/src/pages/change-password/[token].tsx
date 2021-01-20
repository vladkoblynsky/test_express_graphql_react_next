import React from "react";
import { Form, Formik } from "formik";
import { Alert, AlertIcon, Box, Heading } from "@chakra-ui/react";
import InputField from "../../components/InputField";
import { Button } from "@chakra-ui/button";
import Wrapper from "../../components/Wrapper";
import * as yup from "yup";
import { MeDocument, useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { NextPage } from "next";
import { withApollo } from "../../utils/withApollo";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required("This field is required")
    .min(3, "Length must be greater than 3 "),
  token: yup.string().required("This field is required"),
});

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword, { loading }] = useChangePasswordMutation({
    update: (cache, { data }) => {
      cache.writeQuery({
        query: MeDocument,
        data: {
          __typename: "Query",
          me: data?.changePassword.user,
        },
      });
    },
  });
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          newPassword: "",
          token:
            typeof router.query.token === "string" ? router.query.token : "",
        }}
        enableReinitialize={true}
        validationSchema={schema}
        onSubmit={async (values, actions) => {
          const { data } = await changePassword({ variables: values });
          if (data?.changePassword.errors) {
            actions.setErrors(toErrorMap(data.changePassword.errors));
          } else if (data?.changePassword.user) {
            await router.push("/");
          }
        }}
      >
        {({ errors, values }) => (
          <Form>
            <Heading>Set new password</Heading>
            {errors.token && (
              <Alert status="error">
                <AlertIcon />
                <Box mr={1}>{errors.token}</Box>
                <NextLink href="/forgot-password">
                  <Button variant="link">click here to get a new one</Button>
                </NextLink>
              </Alert>
            )}
            <Box mt="10px">
              <InputField
                name="newPassword"
                label="New password"
                placeholder="New Password"
                type="password"
              />
            </Box>
            <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
