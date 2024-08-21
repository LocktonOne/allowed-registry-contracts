// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IAllowedContractRegistry {
    /**
     * @notice The function to add a hash of an allowed contract
     * @dev Access: ADD permission
     * @param hash_ the hash of the bytecode of the contract
     */
    function addAllowedContract(bytes32 hash_) external;

    /**
     * @notice The function to mark whether the contract was deployed
     * @dev Access: SWITCH permission
     * @param hash_ the hash of the bytecode of the contract
     */
    function toggleDeployedFlag(bytes32 hash_) external;

    /**
     * @notice The function to check whether the contract is allowed to be deployed
     * @param hash_ the hash of the bytecode of the contract
     */
    function isAllowedToDeploy(bytes32 hash_) external view returns (bool);

    /**
     * @notice The function to check whether the contract was deployed
     * @param hash_ the hash of the bytecode of the contract
     */
    function isDeployed(bytes32 hash_) external view returns (bool);
}
