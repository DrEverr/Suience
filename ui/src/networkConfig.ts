import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { MVR_NAME, TESTNET_PACKAGE_ID } from "./constants";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: TESTNET_PACKAGE_ID,
        mvrName: MVR_NAME,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
