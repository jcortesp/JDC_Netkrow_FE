import React from "react";
import { Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

export default function JourneyRoute({ steps }) {
  if (!steps || steps.length === 0) return null;

  const boxMinW = useBreakpointValue({ base: "160px", sm: "200px", md: "260px" });
  const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });

  return (
    <Box
      width="100%"
      overflowX="auto"
      py={3}
      px={0}
      tabIndex={0}
      aria-label="Ruta de servicios OMS"
      role="group"
      sx={{
        "&::-webkit-scrollbar": { height: "8px" },
        "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" },
        scrollbarColor: "#CBD5E0 #EDF2F7",
        scrollbarWidth: "thin",
      }}
    >
      <Flex
        align="center"
        wrap="nowrap"
        minW="max-content"
        gap={4}
        width="fit-content"
        role="list"
      >
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <Box
              bg={idx === 0 ? "orange.100" : "teal.100"}
              px={4}
              py={2}
              borderRadius="xl"
              shadow="md"
              minW={boxMinW}
              maxW="70vw"
              border={idx === 0 ? "2px solid orange" : "2px solid teal"}
              fontWeight={idx === 0 ? "bold" : "semibold"}
              fontSize={fontSize}
              textAlign="center"
              wordBreak="break-word"
              whiteSpace="normal"
              overflow="hidden"
              overflowWrap="anywhere"
              sx={{
                hyphens: "auto",
                transition: "background 0.3s",
              }}
              role="listitem"
            >
              {step}
            </Box>
            {idx < steps.length - 1 && (
              <ChevronRightIcon boxSize={8} color="teal.400" flexShrink={0} />
            )}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
}
