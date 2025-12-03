import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  Card,
  Dialog,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";

export interface Profile {
  id: string,
  capId?: string,
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name,
    bio: profile.bio,
    orcid: profile.orcid,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const publications: any[] = [];
  const collaborations: any[] = [];

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const handleEditProfile = () => {
    setEditedProfile({
      name: profile.name,
      bio: profile.bio,
      orcid: profile.orcid,
    });
    setError("");
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profile.capId) {
      setError("Profile capability not found. Cannot update profile.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const tx = new Transaction();

      // Get the profile and cap objects
      const profileObj = tx.object(profile.id);
      const capObj = tx.object(profile.capId);

      // Call update_profile function
      tx.moveCall({
        target: `${packageId}::core::update_profile`,
        arguments: [
          profileObj,
          capObj,
          tx.pure.string(editedProfile.name),
          tx.pure.string(editedProfile.bio),
          tx.pure.string(editedProfile.orcid),
        ],
      });

      // Execute transaction
      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: () => {
              console.log("Profile updated successfully");
              setIsEditDialogOpen(false);
              // In a real app, you would refresh the profile data here
              // For now, we'll just close the dialog
              resolve();
            },
            onError: (error) => {
              console.error("Transaction failed:", error);
              setError(`Failed to update profile: ${error.message}`);
              reject(error);
            },
          }
        );
      });
    } catch (error: any) {
      console.error("Update failed:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <Button size="3" onClick={handleEditProfile}>
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

      {/* Edit Profile Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update your research profile information
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" style={{ display: "block" }}>
                Name
              </Text>
              <TextField.Root
                placeholder="Your name"
                value={editedProfile.name}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
                disabled={isSaving}
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" mb="2" style={{ display: "block" }}>
                Bio
              </Text>
              <TextField.Root
                placeholder="Tell us about your research interests..."
                value={editedProfile.bio}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, bio: e.target.value })
                }
                disabled={isSaving}
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" mb="2" style={{ display: "block" }}>
                ORCID ID
              </Text>
              <TextField.Root
                placeholder="0000-0000-0000-0000"
                value={editedProfile.orcid}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, orcid: e.target.value })
                }
                disabled={isSaving}
              />
            </Box>

            {error && (
              <Box p="2" style={{ background: "var(--red-a2)", borderRadius: "4px" }}>
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  {error}
                </Text>
              </Box>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isSaving}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Container>
  );
}
