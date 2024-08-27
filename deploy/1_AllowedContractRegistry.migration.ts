import { Deployer, Reporter } from "@solarity/hardhat-migrate";

import { AllowedContractRegistry__factory } from "@ethers-v6";

export = async (deployer: Deployer) => {
  await deployer.deploy(AllowedContractRegistry__factory, {
    name: "AllowedContractRegistry",
  });
};
