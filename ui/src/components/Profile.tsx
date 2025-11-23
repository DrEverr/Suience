import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  Card,
} from "@radix-ui/themes";

export interface Profile {
  id: string,
  name: string,
  avatar: string,
  bio: string,
  orcid: string,
  publications: number,
  citations: number,
  hIndex: number,
  collaborators: number,
  totalReviews: number,
  reputation: number,
  joinDate: number,
}

interface ProfileProps {
  userProfile: Profile;
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

export function Profile({ userProfile: profile, onNavigate }: ProfileProps) {
  const publications: any[] = [];

  const collaborations: any[] = [];

  return (
    <Container size="2" px="4" py="4">
      {/* Profile Header */}
      <Box mb="6">
        <Flex direction="column" align="center" gap="4" mb="4">
          <Box
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            {profile.avatar}
          </Box>

          <Box style={{ textAlign: "center" }}>
            <Flex align="center" justify="center" gap="2" mb="1">
              <Heading size="5">{profile.name || "Anonymous User"}</Heading>
            </Flex>
          </Box>
        </Flex>

        <Card size="2" mb="4">
          <Text size="3">
            {profile.bio ||
              "No bio available. Edit your profile to add a description."}
          </Text>
        </Card>

        <Flex direction="column" gap="2">
          <Button
            size="3"
            onClick={() => {
              // TODO: Implement edit profile functionality
              console.log("Edit profile clicked");
            }}
          >
            Edit Profile
          </Button>

          <Button
            size="3"
            variant="outline"
            onClick={() => onNavigate("dashboard")}
          >
            Share Profile
          </Button>
        </Flex>
      </Box>

      {/* Statistics */}
      <Box mb="6">
        <Heading size="4" mb="3">
          Research Statistics
        </Heading>
        <Flex direction="column" gap="3">
          <Flex justify="between">
            <Card size="1" style={{ flex: 1, marginRight: "8px" }}>
              <Box style={{ textAlign: "center" }}>
                <Text size="5" weight="bold" style={{ display: "block" }}>
                  {profile.publications}
                </Text>
                <Text size="2" color="gray">
                  Publications
                </Text>
              </Box>
            </Card>
            <Card size="1" style={{ flex: 1, marginLeft: "8px" }}>
              <Box style={{ textAlign: "center" }}>
                <Text size="5" weight="bold" style={{ display: "block" }}>
                  {profile.citations}
                </Text>
                <Text size="2" color="gray">
                  Citations
                </Text>
              </Box>
            </Card>
          </Flex>

          <Flex justify="between">
            <Card size="1" style={{ flex: 1, marginRight: "8px" }}>
              <Box style={{ textAlign: "center" }}>
                <Text size="5" weight="bold" style={{ display: "block" }}>
                  {profile.hIndex}
                </Text>
                <Text size="2" color="gray">
                  h-index
                </Text>
              </Box>
            </Card>
            <Card size="1" style={{ flex: 1, marginLeft: "8px" }}>
              <Box style={{ textAlign: "center" }}>
                <Text
                  size="5"
                  weight="bold"
                  style={{ display: "block", color: "#4E9BF1" }}
                >
                  {profile.reputation}
                </Text>
                <Text size="2" color="gray">
                  Reputation
                </Text>
              </Box>
            </Card>
          </Flex>
        </Flex>
      </Box>

      {/* Publications */}
      <Box mb="6">
        <Flex justify="between" align="center" mb="3">
          <Heading size="4">Recent Publications</Heading>
          <Button size="1" variant="ghost" onClick={() => onNavigate("feed")}>
            View All
          </Button>
        </Flex>
        {publications.length > 0 ? (
          <Flex direction="column" gap="3">
            {publications.slice(0, 3).map((pub) => (
              <Card key={pub.id} size="2">
                <Box>
                  <Text size="3" weight="medium" mb="1">
                    {pub.title}
                  </Text>
                  <Text size="2" color="gray" mb="2">
                    {pub.journal} • {pub.year}
                  </Text>
                  <Flex justify="between" align="center">
                    <Text size="2" style={{ color: "#4E9BF1" }}>
                      📊 {pub.citations} citations
                    </Text>
                    <Button size="1" variant="ghost">
                      View
                    </Button>
                  </Flex>
                </Box>
              </Card>
            ))}
          </Flex>
        ) : (
          <Box p="4" style={{ textAlign: "center" }}>
            <Text size="3" color="gray">
              No publications yet. Upload your first research to get started!
            </Text>
          </Box>
        )}
      </Box>

      {/* Active Collaborations */}
      <Box mb="6">
        <Flex justify="between" align="center" mb="3">
          <Heading size="4">Active Collaborations</Heading>
          <Button
            size="1"
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
          >
            View All
          </Button>
        </Flex>
        {collaborations.length > 0 ? (
          <Flex direction="column" gap="3">
            {collaborations.map((collab) => (
              <Card key={collab.id} size="2">
                <Box>
                  <Text size="3" weight="medium" mb="1">
                    {collab.title}
                  </Text>
                  <Text size="2" color="gray" mb="2">
                    With {collab.collaborators.join(", ")}
                  </Text>
                  <Flex justify="between" align="center">
                    <Box
                      px="2"
                      py="1"
                      style={{
                        background:
                          collab.status === "Completed"
                            ? "var(--green-a3)"
                            : "var(--blue-a3)",
                        borderRadius: "4px",
                      }}
                    >
                      <Text size="1" weight="medium">
                        {collab.status}
                      </Text>
                    </Box>
                    <Text size="2" color="gray">
                      {collab.progress}% complete
                    </Text>
                  </Flex>
                </Box>
              </Card>
            ))}
          </Flex>
        ) : (
          <Box p="4" style={{ textAlign: "center" }}>
            <Text size="3" color="gray">
              No active collaborations. Connect with other researchers to start
              collaborating!
            </Text>
          </Box>
        )}
      </Box>

      {/* Profile Details */}
      <Box>
        <Heading size="4" mb="3">
          Profile Details
        </Heading>
        <Card size="2">
          <Flex direction="column" gap="3">
            <Flex justify="between">
              <Text size="2" color="gray">
                ORCID ID:
              </Text>
              <Text size="2">{profile.orcid || "Not provided"}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="2" color="gray">
                Member Since:
              </Text>
              <Text size="2">{profile.joinDate || "Not set"}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="2" color="gray">
                Total Reviews:
              </Text>
              <Text size="2">{profile.totalReviews}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="2" color="gray">
                Collaborators:
              </Text>
              <Text size="2">{profile.collaborators}</Text>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Container>
  );
}
