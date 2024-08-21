// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {AbstractDependant} from "@solarity/solidity-lib/contracts-registry/AbstractDependant.sol";

import {MasterContractsRegistry} from "@tokene/core-contracts/core/MasterContractsRegistry.sol";
import {MasterAccessManagement} from "@tokene/core-contracts/core/MasterAccessManagement.sol";

import {IAllowedContractRegistry} from "./interfaces/IAllowedContractRegistry.sol";

/**
 * @notice The AllowedContractRegistry contract.
 * The contact main purpose is to store contracts that are allowed to deploy.
 * Contracts are stored in the form of hashed bytecode. Additionally, there is a flag
 * that indicates whether the contract has been deployed, ensuring that contract deployment
 * won't be abused. Integrated with the MasterAccessManagement contract.
 */
contract AllowedContractRegistry is ERC165, IAllowedContractRegistry, AbstractDependant {
    string public constant ALLOWED_CONTRACT_REGISTRY_RESOURCE =
        "ALLOWED_CONTRACT_REGISTRY_RESOURCE";

    string public constant ADD_CONTRACT_PERMISSION = "ADD_CONTRACT";
    string public constant SWITCH_FLAG_PERMISSION = "SWITCH_FLAG";

    MasterAccessManagement public masterAccess;

    mapping(bytes32 => bool) internal _allowedContracts;
    mapping(bytes32 => bool) internal _deployedContracts;

    modifier onlyAddPermission() {
        _requirePermission(ADD_CONTRACT_PERMISSION);
        _;
    }

    modifier onlySwitchPermission() {
        _requirePermission(SWITCH_FLAG_PERMISSION);
        _;
    }

    /**
     * @inheritdoc IAllowedContractRegistry
     */
    function addAllowedContract(bytes32 hash_) external onlyAddPermission {
        _allowedContracts[hash_] = true;
    }

    /**
     * @inheritdoc IAllowedContractRegistry
     */
    function toggleDeployedFlag(bytes32 hash_) external onlySwitchPermission {
        require(
            _allowedContracts[hash_],
            "AllowedContractRegistry: contract is not allowed for deployment"
        );

        _deployedContracts[hash_] = !_deployedContracts[hash_];
    }

    /**
     * @inheritdoc AbstractDependant
     */
    function setDependencies(address registryAddress_, bytes memory) public override dependant {
        MasterContractsRegistry registry_ = MasterContractsRegistry(registryAddress_);

        masterAccess = MasterAccessManagement(registry_.getMasterAccessManagement());
    }

    /**
     * @inheritdoc IAllowedContractRegistry
     */
    function isAllowedToDeploy(bytes32 hash_) external view returns (bool) {
        return _allowedContracts[hash_];
    }

    /**
     * @inheritdoc IAllowedContractRegistry
     */
    function isDeployed(bytes32 hash_) external view returns (bool) {
        return _deployedContracts[hash_];
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return
            interfaceId == type(AbstractDependant).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _requirePermission(string memory permission_) internal view {
        require(
            masterAccess.hasPermission(
                msg.sender,
                ALLOWED_CONTRACT_REGISTRY_RESOURCE,
                permission_
            ),
            "AllowedContractRegistry: access denied"
        );
    }
}
