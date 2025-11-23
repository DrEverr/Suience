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
import { SealClient } from "@mysten/seal";

interface UploadResearchProps {
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

export function UploadResearch({ onNavigate }: UploadResearchProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;

  const NUM_EPOCH = 10;
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  // Verified key servers https://seal-docs.wal.app/Pricing/#verified-key-servers
  const serverObjectIds = [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  ];
  const client = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  const [researchData, setResearchData] = useState({
    title: "",
    abstract: "",
    field: "",
    keywords: "",
    authors: "",
    institution: "",
    researchType: "research-paper",
    dataFiles: [] as File[],
    manuscriptFile: null as File | null,
    collaborators: "",
    license: "cc-by",
    fundingInfo: "",
    ethicsApproval: false,
    openAccess: true,
  });

  // TODO: Load research types and licenses from configuration
  const researchTypes = [
    { id: "research-paper", label: "Research Paper", icon: "📄" },
    { id: "dataset", label: "Dataset", icon: "📊" },
    { id: "technical-paper", label: "Technical Paper", icon: "🔧" },
    { id: "preprint", label: "Preprint", icon: "📋" },
    { id: "review", label: "Review Article", icon: "📖" },
  ];

  const licenses = [
    { id: "cc-by", label: "CC BY 4.0 - Most open" },
    { id: "cc-by-sa", label: "CC BY-SA 4.0 - Share alike" },
    { id: "cc-by-nc", label: "CC BY-NC 4.0 - Non-commercial" },
    { id: "mit", label: "MIT License" },
    { id: "apache", label: "Apache 2.0" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setResearchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files) return;

    if (field === "manuscriptFile") {
      handleInputChange(field, files[0]);
    } else if (field === "dataFiles") {
      const fileArray = Array.from(files);
      handleInputChange(field, [...researchData.dataFiles, ...fileArray]);
    }
  };

  const removeDataFile = (index: number) => {
    const newFiles = researchData.dataFiles.filter((_, i) => i !== index);
    handleInputChange("dataFiles", newFiles);
  };

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

  const handleSubmit = async () => {
    setIsUploading(true);

    try {
      // TODO: Implement Web3 research upload to Sui blockchain
      // 1. Upload files to Walrus storage
      // 2. Create research object on Sui blockchain
      // 3. Set access policies using Seal
      // 4. Notify peer review network

      // TODO: Simulate upload process - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Navigate back to feed or dashboard
      onNavigate("feed");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStep1 = () => (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="3" weight="medium" mb="3" style={{ display: "block" }}>
            What type of research are you publishing?
          </Text>
          <Flex direction="column" gap="2">
            {researchTypes.map((type) => (
              <Box
                key={type.id}
                p="3"
                onClick={() => handleInputChange("researchType", type.id)}
                style={{
                  border: `2px solid ${researchData.researchType === type.id ? "#4E9BF1" : "var(--gray-a6)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  background:
                    researchData.researchType === type.id
                      ? "var(--blue-a2)"
                      : "var(--gray-a2)",
                }}
              >
                <Flex align="center" gap="3">
                  <Text size="5">{type.icon}</Text>
                  <Box>
                    <Text size="3" weight="medium">
                      {type.label}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Card>
  );

  const renderStep2 = () => (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Title *
          </Text>
          <TextField.Root
            placeholder="Enter your research title..."
            value={researchData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Abstract *
          </Text>
          <TextField.Root
            placeholder="Provide a comprehensive abstract of your research..."
            value={researchData.abstract}
            onChange={(e) => handleInputChange("abstract", e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Research Field *
          </Text>
          <TextField.Root
            placeholder="e.g., Quantum Computing, Machine Learning, Climate Science"
            value={researchData.field}
            onChange={(e) => handleInputChange("field", e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Keywords
          </Text>
          <TextField.Root
            placeholder="quantum, algorithms, error-correction (comma separated)"
            value={researchData.keywords}
            onChange={(e) => handleInputChange("keywords", e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Authors *
          </Text>
          <TextField.Root
            placeholder="Enter author names"
            value={researchData.authors}
            onChange={(e) => handleInputChange("authors", e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Institution
          </Text>
          <TextField.Root
            placeholder="Enter institution name"
            value={researchData.institution}
            onChange={(e) => handleInputChange("institution", e.target.value)}
          />
        </Box>
      </Flex>
    </Card>
  );

  const renderStep3 = () => (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Manuscript File
          </Text>
          <Box
            p="4"
            style={{
              border: "2px dashed var(--gray-a6)",
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("manuscript-upload")?.click()
            }
          >
            {researchData.manuscriptFile ? (
              <Box>
                <Text
                  size="5"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  📄
                </Text>
                <Text size="3" weight="medium">
                  {researchData.manuscriptFile.name}
                </Text>
                <Text size="2" color="gray">
                  Click to replace
                </Text>
              </Box>
            ) : (
              <Box>
                <Text
                  size="5"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  ⬆️
                </Text>
                <Text size="3" weight="medium">
                  Upload Manuscript
                </Text>
                <Text size="2" color="gray">
                  PDF, DOC, or DOCX files
                </Text>
              </Box>
            )}
          </Box>
          <input
            id="manuscript-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload("manuscriptFile", e.target.files)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Research Data Files
          </Text>
          <Box
            p="4"
            style={{
              border: "2px dashed var(--gray-a6)",
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("data-upload")?.click()}
          >
            <Text size="5" style={{ display: "block", marginBottom: "8px" }}>
              💾
            </Text>
            <Text size="3" weight="medium">
              Upload Data Files
            </Text>
            <Text size="2" color="gray">
              CSV, JSON, ZIP, or any data format
            </Text>
          </Box>
          <input
            id="data-upload"
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload("dataFiles", e.target.files)}
          />

          {researchData.dataFiles.length > 0 && (
            <Box mt="3">
              <Text
                size="2"
                weight="medium"
                mb="2"
                style={{ display: "block" }}
              >
                Uploaded Files:
              </Text>
              <Flex direction="column" gap="2">
                {researchData.dataFiles.map((file, index) => (
                  <Flex
                    key={index}
                    justify="between"
                    align="center"
                    p="2"
                    style={{
                      background: "var(--gray-a3)",
                      borderRadius: "4px",
                    }}
                  >
                    <Text size="2">{file.name}</Text>
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => removeDataFile(index)}
                    >
                      ✕
                    </Button>
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Card>
  );

  const renderStep4 = () => (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            License
          </Text>
          <Flex direction="column" gap="2">
            {licenses.map((license) => (
              <Box
                key={license.id}
                p="2"
                onClick={() => handleInputChange("license", license.id)}
                style={{
                  border: `1px solid ${researchData.license === license.id ? "#4E9BF1" : "var(--gray-a6)"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  background:
                    researchData.license === license.id
                      ? "var(--blue-a2)"
                      : "transparent",
                }}
              >
                <Text size="2">{license.label}</Text>
              </Box>
            ))}
          </Flex>
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Collaborators (Wallet Addresses)
          </Text>
          <TextField.Root
            placeholder="Enter wallet addresses (comma separated)"
            value={researchData.collaborators}
            onChange={(e) => handleInputChange("collaborators", e.target.value)}
          />
          <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
            Add wallet addresses of collaborators who should have access
          </Text>
        </Box>

        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            Funding Information
          </Text>
          <TextField.Root
            placeholder="Enter funding information"
            value={researchData.fundingInfo}
            onChange={(e) => handleInputChange("fundingInfo", e.target.value)}
          />
        </Box>

        <Box>
          <Flex align="center" gap="2">
            <input
              type="checkbox"
              id="ethics-approval"
              checked={researchData.ethicsApproval}
              onChange={(e) =>
                handleInputChange("ethicsApproval", e.target.checked)
              }
            />
            <Text size="2">
              This research has received appropriate ethics approval
            </Text>
          </Flex>
        </Box>

        <Box>
          <Flex align="center" gap="2">
            <input
              type="checkbox"
              id="open-access"
              checked={researchData.openAccess}
              onChange={(e) =>
                handleInputChange("openAccess", e.target.checked)
              }
            />
            <Text size="2">Make this research open access</Text>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return researchData.researchType !== "";
      case 2:
        return (
          researchData.title &&
          researchData.abstract &&
          researchData.field &&
          researchData.authors
        );
      case 3:
        return true; // Files are optional
      case 4:
        return true; // All fields are optional
      default:
        return false;
    }
  };

  return (
    <Container size="2" px="4" py="4">
      {/* Header */}
      <Box mb="6">
        <Heading size="6" mb="2">
          Publish Research
        </Heading>
        <Text color="gray" size="3">
          Share your research with the global scientific community on Sui
        </Text>
      </Box>

      {/* Progress Steps */}
      <Flex justify="center" gap="2" mb="6">
        {[1, 2, 3, 4].map((step) => (
          <Box
            key={step}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background:
                currentStep >= step
                  ? "linear-gradient(135deg, #4E9BF1, #00D4FF)"
                  : "var(--gray-a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentStep >= step ? "white" : "var(--gray-11)",
            }}
          >
            <Text size="2" weight="bold">
              {step}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Step Labels */}
      <Flex justify="center" gap="6" mb="6">
        <Text size="1" color={currentStep >= 1 ? "blue" : "gray"}>
          Type
        </Text>
        <Text size="1" color={currentStep >= 2 ? "blue" : "gray"}>
          Details
        </Text>
        <Text size="1" color={currentStep >= 3 ? "blue" : "gray"}>
          Files
        </Text>
        <Text size="1" color={currentStep >= 4 ? "blue" : "gray"}>
          Settings
        </Text>
      </Flex>

      {/* Step Content */}
      <Box mb="6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </Box>

      {/* Navigation Buttons */}
      <Flex justify="between" gap="3">
        <Button
          size="3"
          variant="outline"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onNavigate("dashboard");
            }
          }}
        >
          {currentStep > 1 ? "Previous" : "Cancel"}
        </Button>

        {currentStep < 4 ? (
          <Button
            size="3"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid(currentStep)}
            style={{
              background: isStepValid(currentStep)
                ? "linear-gradient(135deg, #4E9BF1, #00D4FF)"
                : undefined,
              border: "none",
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            size="3"
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep) || isUploading}
            style={{
              background: isStepValid(currentStep)
                ? "linear-gradient(135deg, #4E9BF1, #00D4FF)"
                : undefined,
              border: "none",
            }}
          >
            {isUploading ? "Publishing..." : "Publish Research"}
          </Button>
        )}
      </Flex>

      {/* Info Box */}
      <Card size="2" mt="6">
        <Box>
          <Text size="3" weight="medium" mb="2" style={{ display: "block" }}>
            🔒 Your research will be:
          </Text>
          <Flex direction="column" gap="1">
            <Text size="2">• Encrypted and stored on Walrus</Text>
            <Text size="2">• Published on the Sui blockchain</Text>
            <Text size="2">• Protected by Seal access policies</Text>
            <Text size="2">• Eligible for peer review rewards</Text>
          </Flex>
        </Box>
      </Card>
    </Container>
  );
}
