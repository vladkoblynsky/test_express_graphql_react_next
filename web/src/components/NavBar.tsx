import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/layout";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { Button } from "@chakra-ui/button";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [logout, { loading: logoutFetching, client }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={10}>
      <Flex
        flex={1}
        margin="auto"
        maxWidth={800}
        align="center"
        justifyContent="space-between"
      >
        <Heading>
          <NextLink href="/">Home</NextLink>
        </Heading>

        {data?.me && (
          <Flex align="center">
            <NextLink href="/create-post">
              <Button mr={4}>Create Post</Button>
            </NextLink>
            <Box mr={2}>{data.me.username}</Box>
            <Button
              variant="link"
              onClick={() => {
                logout();
                client.resetStore();
              }}
              isLoading={logoutFetching}
            >
              Logout
            </Button>
          </Flex>
        )}

        {!loading && !data?.me && (
          <Flex align="center">
            <NextLink href="/login">
              <Button variant="link" mr={2}>
                login
              </Button>
            </NextLink>
            <NextLink href="/register">
              <Button variant="link">register</Button>
            </NextLink>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default NavBar;
