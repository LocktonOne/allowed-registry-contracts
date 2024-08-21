import { expect } from "chai";
import { ethers } from "hardhat";
import { keccak256, randomBytes } from "ethers";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { Reverter } from "@/test/helpers/reverter";

import {
  ALLOWED_CONTRACT_REGISTRY_RESOURCE,
  ADD_CONTRACT_PERMISSION,
  SWITCH_FLAG_PERMISSION,
  ALLOWED_CONTRACT_DEP,
} from "./constants";

import { MasterContractsRegistry, MasterAccessManagement, IRBAC, AllowedContractRegistry } from "@ethers-v6";

describe("AllowedContractRegistry", async () => {
  const reverter = new Reverter();

  let OWNER: SignerWithAddress;
  let USER1: SignerWithAddress;
  let USER2: SignerWithAddress;

  const DeployerRole = "DR";
  const NodeRole = "NR";

  const AllowedContractRegistryAdd: IRBAC.ResourceWithPermissionsStruct = {
    resource: ALLOWED_CONTRACT_REGISTRY_RESOURCE,
    permissions: [ADD_CONTRACT_PERMISSION],
  };

  const AllowedContractRegistrySwitch: IRBAC.ResourceWithPermissionsStruct = {
    resource: ALLOWED_CONTRACT_REGISTRY_RESOURCE,
    permissions: [SWITCH_FLAG_PERMISSION],
  };

  let registry: MasterContractsRegistry;
  let masterAccess: MasterAccessManagement;
  let contractRegistry: AllowedContractRegistry;
  let hash: string;

  before("setup", async () => {
    [OWNER, USER1, USER2] = await ethers.getSigners();

    const MasterContractsRegistry = await ethers.getContractFactory("MasterContractsRegistry");
    registry = await MasterContractsRegistry.deploy();

    const MasterAccessManagement = await ethers.getContractFactory("MasterAccessManagement");
    const _masterAccess = await MasterAccessManagement.deploy();

    const AllowedContractRegistry = await ethers.getContractFactory("AllowedContractRegistry");
    const _contractRegistry = await AllowedContractRegistry.deploy();

    await registry.__MasterContractsRegistry_init(await _masterAccess.getAddress());

    masterAccess = <MasterAccessManagement>(
      await ethers.getContractAt("MasterAccessManagement", await registry.getMasterAccessManagement())
    );

    await masterAccess.__MasterAccessManagement_init(OWNER);

    await registry.addProxyContract(ALLOWED_CONTRACT_DEP, await _contractRegistry.getAddress());

    contractRegistry = <AllowedContractRegistry>(
      await ethers.getContractAt("AllowedContractRegistry", await registry.getContract(ALLOWED_CONTRACT_DEP))
    );

    await registry.injectDependencies(ALLOWED_CONTRACT_DEP);

    hash = keccak256(randomBytes(100));

    await reverter.snapshot();
  });

  afterEach("revert", reverter.revert);

  describe("access", () => {
    it("only injector should set dependencies", async () => {
      await expect(contractRegistry.setDependencies(await registry.getAddress(), "0x")).to.be.rejectedWith(
        "Dependant: not an injector",
      );
    });
  });

  describe("addAllowedContract", () => {
    it("should add allowed contract with add role", async () => {
      await masterAccess.addPermissionsToRole(DeployerRole, [AllowedContractRegistryAdd], true);
      await masterAccess.grantRoles(USER1, [DeployerRole]);

      expect(await contractRegistry.isAllowedToDeploy(hash)).to.be.false;

      await contractRegistry.connect(USER1).addAllowedContract(hash);

      expect(await contractRegistry.isAllowedToDeploy(hash)).to.be.true;
    });

    it("should not add allowed contract due to permissions", async () => {
      await expect(contractRegistry.connect(USER1).addAllowedContract(hash)).to.be.rejectedWith(
        "AllowedContractRegistry: access denied",
      );
    });
  });

  describe("toggleDeployedFlag", () => {
    beforeEach("add contract to allowed", async () => {
      await masterAccess.addPermissionsToRole(DeployerRole, [AllowedContractRegistryAdd], true);
      await masterAccess.grantRoles(USER1, [DeployerRole]);

      await contractRegistry.connect(USER1).addAllowedContract(hash);
    });

    it("should switch deployed flag with node role", async () => {
      await masterAccess.addPermissionsToRole(NodeRole, [AllowedContractRegistrySwitch], true);
      await masterAccess.grantRoles(USER2, [NodeRole]);

      await contractRegistry.connect(USER2).toggleDeployedFlag(hash);

      expect(await contractRegistry.isDeployed(hash)).to.be.true;

      await contractRegistry.connect(USER2).toggleDeployedFlag(hash);

      expect(await contractRegistry.isDeployed(hash)).to.be.false;
    });

    it("should not switch deployed flag due to permissions", async () => {
      await expect(contractRegistry.connect(USER2).toggleDeployedFlag(hash)).to.be.rejectedWith(
        "AllowedContractRegistry: access denied",
      );
    });

    it("should not switch deployed flag for not-allowed contract", async () => {
      const hashOfNotAllowed = keccak256(randomBytes(10));

      await masterAccess.addPermissionsToRole(NodeRole, [AllowedContractRegistrySwitch], true);
      await masterAccess.grantRoles(USER2, [NodeRole]);

      await expect(contractRegistry.connect(USER2).toggleDeployedFlag(hashOfNotAllowed)).to.be.rejectedWith(
        "AllowedContractRegistry: contract is not allowed for deployment",
      );
    });
  });

  describe("supportsInterface", () => {
    it("should return true for supportsInterface", async () => {
      // ERC165 -- 0x01ffc9a7
      expect(await contractRegistry.supportsInterface("0x01ffc9a7")).to.be.true;

      // AbstractDependant -- 0xdb911e84
      expect(await contractRegistry.supportsInterface("0xdb911e84")).to.be.true;
    });
  });
});
