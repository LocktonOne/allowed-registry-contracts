import { Deployer } from "@solarity/hardhat-migrate";

import { ApiResponseError } from "node-vault";

import { AllowedContractRegistry__factory, MasterContractsRegistry__factory } from "@/generated-types/ethers";
import { getConfigJsonFromVault } from "./config/config-getter";

export = async (deployer: Deployer) => {
  const vault = require("node-vault")({
    apiVersion: "v1",
    endpoint: process.env.VAULT_ENDPOINT,
    token: process.env.VAULT_TOKEN,
  });

  let config = await getConfigJsonFromVault();
  const registry = await deployer.deployed(MasterContractsRegistry__factory, config.addresses.MasterContractsRegistry);

  const allowedContractRegistry = await registry.getContract("ALLOWED_CONTRACT_REGISTRY");

  const configVault = {
    addresses: {
      AllowedContractRegistry: allowedContractRegistry,
    },
  };

  try {
    await vault.write(process.env.VAULT_UPLOAD_CONFIG_PATH, { data: configVault });
  } catch (error) {
    if ((error as ApiResponseError).response) {
      console.log((error as ApiResponseError).response.body.errors);
    } else {
      console.log(error);
    }
  }
};
