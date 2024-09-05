import { Deployer } from "@solarity/hardhat-migrate";

import { AllowedContractRegistry__factory, MasterContractsRegistry__factory } from "@ethers-v6";
import { getConfigJsonFromVault } from "./config/config-getter";

export = async (deployer: Deployer) => {
  const config = await getConfigJsonFromVault();
  const ALLOWED_CONTRACT_DEP = "ALLOWED_CONTRACT_REGISTRY";

  const allowedContractRegistry = await deployer.deploy(AllowedContractRegistry__factory, {
    name: "AllowedContractRegistry",
  });

  const registry = await deployer.deployed(MasterContractsRegistry__factory, config.addresses.MasterContractsRegistry);

  await registry.addProxyContract(ALLOWED_CONTRACT_DEP, await allowedContractRegistry.getAddress());

  await registry.injectDependencies(ALLOWED_CONTRACT_DEP);

  await allowedContractRegistry.setDependencies(await registry.getAddress(), "0x");
};
