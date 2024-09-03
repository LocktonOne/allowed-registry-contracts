import { Deployer } from "@solarity/hardhat-migrate";

import { AllowedContractRegistry__factory, MasterContractsRegistry__factory } from "@ethers-v6";
import { getConfigJsonFromVault } from "./config/config-getter";

export = async (deployer: Deployer) => {
  const config = await getConfigJsonFromVault();

  const registry = await deployer.deployed(MasterContractsRegistry__factory, config.addresses.MasterContractsRegistry);

  const allowedContractRegistry = await deployer.deploy(AllowedContractRegistry__factory, {
    name: "AllowedContractRegistry",
  });
  await registry.addProxyContract("ALLOWED_CONTRACT_REGISTRY", await allowedContractRegistry.getAddress());
};
