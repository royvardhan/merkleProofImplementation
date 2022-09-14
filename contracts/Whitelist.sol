// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function verify(bytes32[] calldata _proof, uint64 _maxAllowanceToMint) public view returns(bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, _maxAllowanceToMint));
        bool verified = MerkleProof.verify(_proof, merkleRoot, leaf);
        return verified;
    }

}