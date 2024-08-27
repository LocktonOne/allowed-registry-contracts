import { Deployer } from "@solarity/hardhat-migrate";

import { ApiResponseError } from "node-vault";

import { AllowedContractRegistry__factory } from "@/generated-types/ethers";

export = async (deployer: Deployer) => {
  const vault = require("node-vault")({
    apiVersion: "v1",
    endpoint: process.env.VAULT_ENDPOINT,
    token: process.env.VAULT_TOKEN,
  });

  const registry = await deployer.deployed(AllowedContractRegistry__factory, "AllowedContractRegistry");

  const config = {
    addresses: {
      AllowedContractRegistry: await registry.getAddress(),
    },
  };

  try {
    await vault.write(process.env.VAULT_UPLOAD_CONFIG_PATH, { data: config });
  } catch (error) {
    if ((error as ApiResponseError).response) {
      console.log((error as ApiResponseError).response.body.errors);
    } else {
      console.log(error);
    }
  }
};
