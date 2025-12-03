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
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

interface UploadResearchProps {
  onNavigate: (
    view: "home" | "profile" | "register" | "feed" | "upload" | "dashboard",
  ) => void;
}

export function UploadResearch({ onNavigate }: UploadResearchProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

  const NUM_EPOCH = 10;
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

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

  // Upload file to Walrus
  async function uploadToWalrus(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${WALRUS_PUBLISHER}/v1/store?epochs=${NUM_EPOCH}`, {
        method: "PUT",
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Walrus upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.newlyCreated) {
        return result.newlyCreated.blobObject.blobId;
      } else if (result.alreadyCertified) {
        return result.alreadyCertified.blobId;
      }

      return null;
    } catch (error) {
      console.error("Error uploading to Walrus:", error);
      throw error;
    }
  }

  // Get or create research profile
  async function getOrCreateProfile(): Promise<{ profileId: string; capId: string } | null> {
    try {
      // Check if user has a profile
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

      if (res.data.length > 0) {
        const fields = (res.data[0]!.data!.content as { fields: any }).fields;
        return {
          profileId: fields.profile_id as string,
          capId: fields.id.id as string,
        };
      }

      return null;
    } catch (error) {
      console.error("Error checking profile:", error);
      return null;
    }
  }

  const handleSubmit = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Step 1: Get or create profile
      setUploadStatus("Checking profile...");
      const profile = await getOrCreateProfile();

      if (!profile) {
        setError("Please create a research profile first");
        setIsUploading(false);
        return;
      }

      // Step 2: Upload manuscript to Walrus
      let manuscriptBlobId: string | null = null;
      if (researchData.manuscriptFile) {
        setUploadStatus("Uploading manuscript to Walrus...");
        manuscriptBlobId = await uploadToWalrus(researchData.manuscriptFile);
        if (!manuscriptBlobId) {
          throw new Error("Failed to upload manuscript");
        }
      }

      // Step 3: Upload data files to Walrus
      const dataBlobIds: string[] = [];
      if (researchData.dataFiles.length > 0) {
        setUploadStatus(`Uploading ${researchData.dataFiles.length} data files...`);
        for (const file of researchData.dataFiles) {
          const blobId = await uploadToWalrus(file);
          if (blobId) {
            dataBlobIds.push(blobId);
          }
        }
      }

      // Step 4: Create project on blockchain
      setUploadStatus("Creating project on blockchain...");
      const tx = new Transaction();

      // Get the profile object
      const profileObj = tx.object(profile.profileId);
      const capObj = tx.object(profile.capId);

      // Create project
      const [projectCap] = tx.moveCall({
        target: `${packageId}::project::create_project`,
        arguments: [
          profileObj,
          capObj,
          tx.pure.string(researchData.title),
        ],
      });

      // Transfer the project cap to the sender
      tx.transferObjects([projectCap], tx.pure.address(currentAccount.address));

      // Execute transaction
      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log("Project created:", result);
              setUploadStatus("Research published successfully!");
              setTimeout(() => {
                onNavigate("feed");
              }, 2000);
              resolve();
            },
            onError: (error) => {
              console.error("Transaction failed:", error);
              setError(`Failed to create project: ${error.message}`);
              reject(error);
            },
          }
        );
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      setError(error.message || "Upload failed. Please try again.");
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

      {/* Upload Status */}
      {(uploadStatus || error) && (
        <Box mb="4">
          {uploadStatus && (
            <Card size="2" style={{ background: "var(--blue-a2)" }}>
              <Text size="2" style={{ color: "#4E9BF1" }}>
                {uploadStatus}
              </Text>
            </Card>
          )}
          {error && (
            <Card size="2" style={{ background: "var(--red-a2)" }}>
              <Text size="2" style={{ color: "var(--red-11)" }}>
                {error}
              </Text>
            </Card>
          )}
        </Box>
      )}

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
          disabled={isUploading}
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
              background: isStepValid(currentStep) && !isUploading
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
