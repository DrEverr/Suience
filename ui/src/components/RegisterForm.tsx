import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  Card,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

interface RegisterFormProps {
  onRegister: (profile: any) => void;
  onCancel: () => void;
}

export function RegisterForm({ onRegister, onCancel }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    field: "",
    bio: "",
    location: "",
    orcid: "",
    email: "",
    website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const packageId = useNetworkVariable('packageId');
    const suiClient = useSuiClient();
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

    try {
      const newProfile = {
        ...formData,
      };
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::core::register_research_profile`,
        // We prevalidate that the name exists
        arguments: [tx.pure.string(newProfile.name)],
      });
      tx.setGasBudget(10000000);
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log('res', result);
            // Extract the created profile object ID from the transaction result
            const profileObject = result.effects?.created?.find(
              (item) => item.owner && typeof item.owner === 'object' && 'Shared' in item.owner,
            );
            const createdObjectId = profileObject?.reference?.objectId;
            if (createdObjectId) {
              onRegister(newProfile);
            }
          },
        },
      );
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name;

  return (
    <Container size="2" px="4" py="4">
      {/* Header */}
      <Box mb="6" style={{ textAlign: "center" }}>
        <Text size="8" style={{ display: "block", marginBottom: "8px" }}>
          🔬
        </Text>
        <Heading size="6" mb="2">
          Join Suience
        </Heading>
        <Text color="gray" size="3">
          Create your research profile on the decentralized science platform
        </Text>
      </Box>

      {/* Registration Form */}
      <Card size="3" mb="6">
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Full Name *
            </Text>
            <TextField.Root
              placeholder="Dr. Maria Rodriguez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Institution
            </Text>
            <TextField.Root
              placeholder="MIT Research Lab"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Research Field
            </Text>
            <TextField.Root
              placeholder="Quantum Computing"
              value={formData.field}
              onChange={(e) => handleInputChange("field", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Location
            </Text>
            <TextField.Root
              placeholder="Boston, MA"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              ORCID ID
            </Text>
            <TextField.Root
              placeholder="0000-0002-1825-0097"
              value={formData.orcid}
              onChange={(e) => handleInputChange("orcid", e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              Optional: Link your existing ORCID profile
            </Text>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Email
            </Text>
            <TextField.Root
              type="email"
              placeholder="maria@university.edu"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Website
            </Text>
            <TextField.Root
              placeholder="https://myresearch.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
              Bio
            </Text>
            <TextField.Root
              placeholder="Tell us about your research interests and background..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              Describe your research focus and what you hope to achieve on
              Suience
            </Text>
          </Box>
        </Flex>
      </Card>

      {/* Terms and Benefits */}
      <Card size="2" mb="6">
        <Box>
          <Text size="3" weight="medium" mb="3" style={{ display: "block" }}>
            What you get with Suience:
          </Text>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Text>✅</Text>
              <Text size="2">Decentralized research publication</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text>✅</Text>
              <Text size="2">Transparent peer review system</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text>✅</Text>
              <Text size="2">Encrypted data storage on Walrus</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text>✅</Text>
              <Text size="2">Token rewards for quality contributions</Text>
            </Flex>
            <Flex align="center" gap="2">
              <Text>✅</Text>
              <Text size="2">Global collaboration opportunities</Text>
            </Flex>
          </Flex>
        </Box>
      </Card>

      {/* Action Buttons */}
      <Flex direction="column" gap="3">
        <Button
          size="4"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          style={{
            background: isFormValid
              ? "linear-gradient(135deg, #4E9BF1, #00D4FF)"
              : undefined,
            border: "none",
            opacity: isFormValid ? 1 : 0.6,
          }}
        >
          {isSubmitting ? "Creating Profile..." : "Create My Suience Profile"}
        </Button>

        <Button
          size="4"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Flex>

      {/* Privacy Notice */}
      <Box mt="4" style={{ textAlign: "center" }}>
        <Text size="1" color="gray">
          By creating a profile, you agree to store your research data on the
          Sui blockchain. Your data is encrypted and you maintain full control
          over access permissions.
        </Text>
      </Box>
    </Container>
  );
}
