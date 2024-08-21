import { Deployer, Reporter } from "@solarity/hardhat-migrate";

import { AllowedContractRegistry__factory } from "@ethers-v6";

export = async (deployer: Deployer) => {
  const registry = await deployer.deploy(AllowedContractRegistry__factory);

  Reporter.reportContracts(["AllowedContractRegistry", await registry.getAddress()]);
};
