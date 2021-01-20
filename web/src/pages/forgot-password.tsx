import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Box, Heading } from "@chakra-ui/react";
import InputField from "../components/InputField";
import { Button } from "@chakra-ui/button";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import * as yup from "yup";
import { withApollo } from "../utils/withApollo";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("This field is required")
    .min(2, "Length must be greater than 2 ")
    .email("Invalid email"),
});

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [sendEmail, { loading }] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        validationSchema={schema}
        onSubmit={async (values, actions) => {
          await sendEmail({ variables: values });
          setComplete(true);
        }}
      >
        <Form>
          <Heading>Forgot password</Heading>
          {complete ? (
            <Box>
              If an account with that email exists, we sent you can email
            </Box>
          ) : (
            <>
              <Box mt="10px">
                <InputField
                  name="email"
                  label="Email"
                  placeholder="Email"
                  type="email"
                />
              </Box>
              <Box>
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={loading}
                  type="submit"
                >
                  Send email
                </Button>
              </Box>
            </>
          )}
        </Form>
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
