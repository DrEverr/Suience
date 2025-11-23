import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";

interface ResearchFeedProps {
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

export function ResearchFeed({ onNavigate }: ResearchFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // TODO: Replace with actual Web3 research data from blockchain
  const categories = [
    { id: "all", label: "All Research", count: 0 },
    { id: "quantum", label: "Quantum Computing", count: 0 },
    { id: "ai", label: "Artificial Intelligence", count: 0 },
    { id: "climate", label: "Climate Science", count: 0 },
    { id: "medical", label: "Medical Research", count: 0 },
  ];

  return (
    <Container size="2" px="4" py="4">
      {/* Header */}
      <Box mb="4">
        <Heading size="6" mb="2">
          Suient Feed
        </Heading>
        <Text color="gray" size="3">
          Discover the latest research and collaborate with scientists worldwide
        </Text>
      </Box>

      {/* Search Bar */}
      <Box mb="4">
        <TextField.Root
          placeholder="Search research, authors, or fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="3"
        />
      </Box>

      {/* Category Filter */}
      <Box mb="6">
        <Flex gap="2" style={{ overflowX: "auto", paddingBottom: "8px" }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              size="2"
              variant={selectedCategory === category.id ? "solid" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                minWidth: "fit-content",
                background:
                  selectedCategory === category.id
                    ? "linear-gradient(135deg, #4E9BF1, #00D4FF)"
                    : undefined,
                border: selectedCategory === category.id ? "none" : undefined,
              }}
            >
              {category.label} ({category.count})
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Research Posts */}
      <Box p="4" style={{ textAlign: "center" }}>
        <Text size="5" style={{ display: "block", marginBottom: "16px" }}>
          🔬
        </Text>
        <Text size="4" weight="medium" mb="2" style={{ display: "block" }}>
          No Research Available
        </Text>
        <Text size="3" color="gray" mb="4" style={{ display: "block" }}>
          Connect your wallet to view research publications, or be the first to
          upload research to Suience!
        </Text>
        <Button
          size="3"
          onClick={() => onNavigate("upload")}
          style={{
            background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
            border: "none",
          }}
        >
          Upload First Research
        </Button>
      </Box>

      {/* Quick Actions FAB */}
      <Box position="fixed" bottom="20px" right="20px" style={{ zIndex: 10 }}>
        <Button
          size="4"
          onClick={() => onNavigate("upload")}
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          ➕
        </Button>
      </Box>
    </Container>
  );
}
