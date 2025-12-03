import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  TextField,
  Card,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";

interface ResearchFeedProps {
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

interface ResearchProject {
  id: string;
  name: string;
  author: string;
  authorAddress: string;
  timestamp: number;
  papers: string[];
  data: string[];
}

export function ResearchFeed({ onNavigate }: ResearchFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);

  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  // Load research projects from blockchain
  useEffect(() => {
    loadProjects();
  }, [currentAccount, packageId]);

  async function loadProjects() {
    try {
      setLoading(true);

      // Get all shared Project objects
      const projectsResponse = await suiClient.getOwnedObjects({
        owner: currentAccount?.address || "0x0",
        options: {
          showContent: true,
          showType: true,
        },
      });

      const loadedProjects: ResearchProject[] = [];

      for (const obj of projectsResponse.data) {
        if (obj.data?.content && "fields" in obj.data.content) {
          const fields = obj.data.content.fields as any;
          if (fields.name) {
            loadedProjects.push({
              id: obj.data.objectId,
              name: fields.name || "Untitled Project",
              author: "Researcher",
              authorAddress: currentAccount?.address || "",
              timestamp: Date.now(),
              papers: [],
              data: [],
            });
          }
        }
      }

      setProjects(loadedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { id: "all", label: "All Research", count: projects.length },
    { id: "quantum", label: "Quantum Computing", count: 0 },
    { id: "ai", label: "Artificial Intelligence", count: 0 },
    { id: "climate", label: "Climate Science", count: 0 },
    { id: "medical", label: "Medical Research", count: 0 },
  ];

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
      {loading ? (
        <Box p="4" style={{ textAlign: "center" }}>
          <Text size="3" color="gray">
            Loading research...
          </Text>
        </Box>
      ) : filteredProjects.length > 0 ? (
        <Flex direction="column" gap="4">
          {filteredProjects.map((project) => (
            <Card key={project.id} size="3">
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="4" weight="bold" mb="2" style={{ display: "block" }}>
                    {project.name}
                  </Text>
                  <Flex align="center" gap="2" mb="2">
                    <Text size="2" color="gray">
                      by {project.author}
                    </Text>
                    <Text size="2" color="gray">
                      •
                    </Text>
                    <Text size="2" color="gray">
                      {new Date(project.timestamp).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Box>
                <Flex justify="between" align="center">
                  <Flex gap="3">
                    {project.papers.length > 0 && (
                      <Text size="2" style={{ color: "#4E9BF1" }}>
                        📄 {project.papers.length} papers
                      </Text>
                    )}
                    {project.data.length > 0 && (
                      <Text size="2" style={{ color: "#4E9BF1" }}>
                        💾 {project.data.length} datasets
                      </Text>
                    )}
                  </Flex>
                  <Button size="2" variant="soft">
                    View Details
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      ) : (
        <Box p="4" style={{ textAlign: "center" }}>
          <Text size="5" style={{ display: "block", marginBottom: "16px" }}>
            🔬
          </Text>
          <Text size="4" weight="medium" mb="2" style={{ display: "block" }}>
            No Research Available
          </Text>
          <Text size="3" color="gray" mb="4" style={{ display: "block" }}>
            {currentAccount
              ? "Be the first to upload research to Suience!"
              : "Connect your wallet to view research publications!"}
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
      )}

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
