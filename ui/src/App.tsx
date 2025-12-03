import { ConnectButton, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Button, Text } from "@radix-ui/themes";
import { useState } from "react";
import React from "react";
import {
  Dashboard,
  Profile,
  RegisterForm,
  ResearchFeed,
  UploadResearch,
} from "./components";
import { useNetworkVariable } from "./networkConfig";

type View = "home" | "profile" | "register" | "feed" | "upload" | "dashboard";

function App() {
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  const [currentView, setCurrentView] = useState<View>("home");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  async function getProfile() {
    // load all caps
    const res = await suiClient.getOwnedObjects({
      owner: currentAccount?.address!,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: `${packageId}::core::ResearchProfileCap`,
      },
    });

    // find the cap for the given profile id
    const capData = res.data
      .map((obj) => {
        const fields = (obj!.data!.content as { fields: any }).fields;
        return {
          capId: fields?.id.id as string,
          profile_id: fields?.profile_id as string,
        };
      });

    if (capData.length === 0) {
      return false;
    }

    // load the profile object
    const profileObj = await suiClient.getObject({
      id: capData[0].profile_id!,
      options: { showContent: true },
    });
    const fields = (profileObj.data?.content as { fields: any })?.fields || {};
    setUserProfile({
      id: capData[0].profile_id!,
      capId: capData[0].capId!,
      name: fields.name as string || "",
      avatar: "👤",
      bio: fields.bio as string || "",
      orcid: fields.orcid as string || "",
      citations: 0,
      collaborators: 0,
      hIndex: 0,
      publications: 0,
      reputation: 0,
      totalReviews: 0,
      joinDate: 0,
    });
    return true;
  }

  const checkUserProfile = async () => {
    if (!currentAccount) {
      // If wallet not connected, do nothing
      // User needs to connect wallet first via the Connect button
      return;
    }

    const hasProfile = await getProfile();

    if (hasProfile) {
      setCurrentView("profile");
    } else {
      setCurrentView("register");
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />;
      case "profile":
        return (
          <Profile userProfile={userProfile!} onNavigate={setCurrentView} />
        );
      case "register":
        return (
          <RegisterForm
            onRegister={(profile: any) => {
              setUserProfile(profile);
              setCurrentView("profile");
            }}
            onCancel={() => setCurrentView("home")}
          />
        );
      case "feed":
        return <ResearchFeed onNavigate={setCurrentView} />;
      case "upload":
        return <UploadResearch onNavigate={setCurrentView} />;
      default:
        return (
          <Container size="2" px="4" py="6">
            {/* Hero Section */}
            <Box mb="8" style={{ textAlign: "center" }}>
              <Text
                size="9"
                weight="bold"
                style={{
                  background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                🔬 Suience
              </Text>
              <Text size="4" color="gray" mt="2" style={{ display: "block" }}>
                Science Flows on Sui
              </Text>
              <Text
                size="6"
                weight="medium"
                mt="4"
                style={{ display: "block" }}
              >
                Democratizing scientific discovery through decentralized
                collaboration
              </Text>
            </Box>

            {/* Feature Cards */}
            <Flex direction="column" gap="4" mb="6">
              <Box
                p="4"
                style={{
                  background: "var(--gray-a3)",
                  borderRadius: "12px",
                  border: "1px solid var(--gray-a6)",
                }}
              >
                <Flex align="center" gap="3" mb="2">
                  <Text size="5">🔬</Text>
                  <Text size="4" weight="medium">
                    Publish Research
                  </Text>
                </Flex>
                <Text size="3" color="gray">
                  Share your research with the global scientific community
                </Text>
              </Box>

              <Box
                p="4"
                style={{
                  background: "var(--gray-a3)",
                  borderRadius: "12px",
                  border: "1px solid var(--gray-a6)",
                }}
              >
                <Flex align="center" gap="3" mb="2">
                  <Text size="5">📊</Text>
                  <Text size="4" weight="medium">
                    Peer Review
                  </Text>
                </Flex>
                <Text size="3" color="gray">
                  Participate in transparent peer review processes
                </Text>
              </Box>

              <Box
                p="4"
                style={{
                  background: "var(--gray-a3)",
                  borderRadius: "12px",
                  border: "1px solid var(--gray-a6)",
                }}
              >
                <Flex align="center" gap="3" mb="2">
                  <Text size="5">💾</Text>
                  <Text size="4" weight="medium">
                    Store Data
                  </Text>
                </Flex>
                <Text size="3" color="gray">
                  Secure, encrypted storage for research data
                </Text>
              </Box>

              <Box
                p="4"
                style={{
                  background: "var(--gray-a3)",
                  borderRadius: "12px",
                  border: "1px solid var(--gray-a6)",
                }}
              >
                <Flex align="center" gap="3" mb="2">
                  <Text size="5">💰</Text>
                  <Text size="4" weight="medium">
                    Earn Rewards
                  </Text>
                </Flex>
                <Text size="3" color="gray">
                  Get rewarded for quality research and reviews
                </Text>
              </Box>
            </Flex>

            {/* Action Buttons */}
            <Flex direction="column" gap="3">
              <Button
                size="4"
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "linear-gradient(135deg, #4E9BF1, #00D4FF)",
                  border: "none",
                }}
              >
                Enter My Suience
              </Button>

              <Button size="4" variant="outline" onClick={checkUserProfile}>
                View My Profile
              </Button>

              <Button
                size="4"
                variant="soft"
                onClick={() => setCurrentView("feed")}
              >
                Browse Research Feed
              </Button>
            </Flex>
          </Container>
        );
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-1)" }}>
      {/* Header */}
      <Flex
        position="sticky"
        px="4"
        py="3"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a6)",
          background: "var(--gray-2)",
          zIndex: 100,
          top: 0,
        }}
      >
        <Flex align="center" gap="2">
          <Button
            size="2"
            variant="ghost"
            className="hamburger-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              marginRight: "8px",
              fontSize: "18px",
              width: "40px",
              height: "40px",
            }}
          >
            ☰
          </Button>
          <Box
            onClick={() => {
              setCurrentView("home");
              setIsMenuOpen(false);
            }}
            style={{ cursor: "pointer" }}
          >
            <Flex align="center" gap="2">
              <Text size="6" weight="bold">
                🌊
              </Text>
              <Heading size="5" style={{ color: "#4E9BF1" }}>
                Suience
              </Heading>
            </Flex>
          </Box>
        </Flex>

        <Flex align="center" gap="2">
          <ConnectButton />
        </Flex>
      </Flex>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          className="menu-overlay"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 200,
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <Box
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        className={`side-menu ${isMenuOpen ? "open" : "closed"}`}
        style={{
          width: "280px",
          background: "var(--gray-2)",
          borderRight: "1px solid var(--gray-a6)",
          zIndex: 300,
          paddingTop: "80px",
        }}
      >
        <Container size="1" px="4">
          {/* Menu Header */}
          <Box mb="6">
            <Flex align="center" gap="2" mb="4">
              <Text size="6" weight="bold">
                🌊
              </Text>
              <Heading size="4" style={{ color: "#4E9BF1" }}>
                Suience
              </Heading>
            </Flex>
            <Text size="2" color="gray">
              Science Flows on Sui
            </Text>
          </Box>

          <Flex direction="column" gap="2">
            <Button
              size="3"
              variant="ghost"
              className="menu-item"
              onClick={() => {
                setCurrentView("home");
                setIsMenuOpen(false);
              }}
              style={{
                justifyContent: "flex-start",
              }}
            >
              🏠 Home
            </Button>
            <Button
              size="3"
              variant="ghost"
              className="menu-item"
              onClick={() => {
                setCurrentView("dashboard");
                setIsMenuOpen(false);
              }}
              style={{
                justifyContent: "flex-start",
              }}
            >
              📊 Dashboard
            </Button>
            <Button
              size="3"
              variant="ghost"
              className="menu-item"
              onClick={() => {
                setCurrentView("feed");
                setIsMenuOpen(false);
              }}
              style={{
                justifyContent: "flex-start",
              }}
            >
              📰 Research Feed
            </Button>
            <Button
              size="3"
              variant="ghost"
              className="menu-item"
              onClick={() => {
                setCurrentView("upload");
                setIsMenuOpen(false);
              }}
              style={{
                justifyContent: "flex-start",
              }}
            >
              ➕ Upload Research
            </Button>
            <Button
              size="3"
              variant="ghost"
              className="menu-item"
              onClick={() => {
                checkUserProfile();
                setIsMenuOpen(false);
              }}
              style={{
                justifyContent: "flex-start",
              }}
            >
              👤 My Profile
            </Button>
          </Flex>

          {/* Menu Footer */}
          <Box mt="8" pt="4" style={{ borderTop: "1px solid var(--gray-a6)" }}>
            <Text size="1" color="gray" style={{ textAlign: "center" }}>
              Democratizing scientific discovery
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box>{renderMainContent()}</Box>
    </Box>
  );
}

export default App;
