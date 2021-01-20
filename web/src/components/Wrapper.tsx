import React from "react";
import { Box } from "@chakra-ui/layout";

export type WrapperVariant = "regular" | "small";

interface WrapperProps {
  variant?: WrapperVariant;
}

const Wrapper: React.FC<WrapperProps> = ({ variant = "regular", children }) => {
  return (
    <Box
      mt="20px"
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      width="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
