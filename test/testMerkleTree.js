const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccack256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address, spots) {
  // equivalent of abi.encodePacked of Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("Test to see if the merkle is working properly", function () {
  it("Should match the merkle gerated in this script and in the smart contract", async function () {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    // Create an array of elements you wish to encode in the Merkle Tree
    const list = [
      encodeLeaf(owner.address, 2),
      encodeLeaf(addr1.address, 2),
      encodeLeaf(addr2.address, 2),
      encodeLeaf(addr3.address, 2),
      encodeLeaf(addr4.address, 2),
      encodeLeaf(addr5.address, 2),
    ];

    // Create the Merkle Tree using the hashing algorithm `keccak256`
    // Make sure to sort the tree so that it can be produced deterministically regardless
    // of the order of the input list

    const merkletree = new MerkleTree(list, keccack256, {
      hashLeaves: true,
      sortPairs: true,
    });
    // Get the merkle root
    const root = merkletree.getHexRoot();

    // Deploy the Whitelist contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();

    // Compute the Merkle Proof of the owner address (0'th item in list)
    // off-chain. The leaf node is the hash of that value.
    const leaf = keccack256(list[0]);
    const proof = merkletree.getHexProof(leaf);

    // Provide the Merkle Proof to the contract, and ensure that it can verify
    // that this leaf node was indeed part of the Merkle Tree
    let verified = await Whitelist.verify(proof, 2);
    expect(verified).to.equal(true);

    // Provide an invalid Merkle Proof to the contract, and ensure that
    // it can verify that this leaf node was NOT part of the Merkle Tree
    verified = await Whitelist.verify([], 2);
    expect(verified).to.equal(false);
  });
});
