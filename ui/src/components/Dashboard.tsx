import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  Card,
} from "@radix-ui/themes";

interface DashboardProps {
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // TODO: Replace with actual Web3 data
  const stats = {
    publications: 0,
    reviews: 0,
    tokens: 0,
    collaborations: 0,
  };

  const recentActivity: any[] = [];

  return (
    <Container size="2" px="4" py="4">
      {/* Header */}
      <Box mb="6">
        <Heading size="6" mb="2">
          My Suience Dashboard
        </Heading>
        <Text color="gray" size="3">
          Welcome back! Here's your research activity overview.
        </Text>
      </Box>

      {/* Stats Cards */}
      <Flex direction="column" gap="4" mb="6">
        <Card size="2">
          <Flex justify="between" align="center">
            <Box>
              <Text size="2" color="gray">
                Publications
              </Text>
              <Text size="6" weight="bold">
                {stats.publications}
              </Text>
            </Box>
            <Text size="8">📄</Text>
          </Flex>
        </Card>

        <Card size="2">
          <Flex justify="between" align="center">
            <Box>
              <Text size="2" color="gray">
                Reviews Completed
              </Text>
              <Text size="6" weight="bold">
                {stats.reviews}
              </Text>
            </Box>
            <Text size="8">📊</Text>
          </Flex>
        </Card>

        <Card size="2">
          <Flex justify="between" align="center">
            <Box>
              <Text size="2" color="gray">
                Review Rewards (SUI)
              </Text>
              <Text size="6" weight="bold" style={{ color: "#4E9BF1" }}>
                {stats.tokens}
              </Text>
            </Box>
            <Text size="8">💰</Text>
          </Flex>
        </Card>

        <Card size="2">
          <Flex justify="between" align="center">
            <Box>
              <Text size="2" color="gray">
                Active Collaborations
              </Text>
              <Text size="6" weight="bold">
                {stats.collaborations}
              </Text>
            </Box>
            <Text size="8">🤝</Text>
          </Flex>
        </Card>
      </Flex>

      {/* Quick Actions */}
      <Box mb="6">
        <Heading size="4" mb="3">
          Quick Actions
        </Heading>
        <Flex direction="column" gap="3">
          <Button
            size="3"
            onClick={() => onNavigate("upload")}
            style={{
              background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
              border: "none",
            }}
          >
            🔬 Upload New Research
          </Button>

          <Button size="3" variant="outline" onClick={() => onNavigate("feed")}>
            📰 Browse Research Feed
          </Button>

          <Button size="3" variant="soft">
            💾 Access Data Vault
          </Button>

          <Button size="3" variant="ghost">
            🔍 Find Collaborators
          </Button>
        </Flex>
      </Box>

      {/* Recent Activity */}
      <Box mb="6">
        <Heading size="4" mb="3">
          Recent Activity
        </Heading>
        {recentActivity.length > 0 ? (
          <Flex direction="column" gap="3">
            {recentActivity.map((activity) => (
              <Card key={activity.id} size="2">
                <Box>
                  <Flex justify="between" align="start" mb="1">
                    <Text size="3" weight="medium">
                      {activity.title}
                    </Text>
                    <Text size="1" color="gray">
                      {activity.date}
                    </Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text
                      size="2"
                      color="gray"
                      style={{ textTransform: "capitalize" }}
                    >
                      {activity.type}
                    </Text>
                    <Box
                      px="2"
                      py="1"
                      style={{
                        background:
                          activity.status === "Completed"
                            ? "var(--green-a3)"
                            : "var(--orange-a3)",
                        borderRadius: "4px",
                      }}
                    >
                      <Text size="1" weight="medium">
                        {activity.status}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Card>
            ))}
          </Flex>
        ) : (
          <Box p="4" style={{ textAlign: "center" }}>
            <Text size="3" color="gray">
              No recent activity. Start by uploading your first research!
            </Text>
          </Box>
        )}
      </Box>

      {/* Suient Feed Preview */}
      <Box>
        <Flex justify="between" align="center" mb="3">
          <Heading size="4">Suient Feed</Heading>
          <Button size="1" variant="ghost" onClick={() => onNavigate("feed")}>
            View All
          </Button>
        </Flex>

        <Box p="4" style={{ textAlign: "center" }}>
          <Text size="3" color="gray">
            No research feed available. Connect your wallet to view research
            publications.
          </Text>
        </Box>
      </Box>
    </Container>
  );
}
