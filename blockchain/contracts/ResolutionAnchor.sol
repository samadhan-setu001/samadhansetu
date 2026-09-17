// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ResolutionAnchor
 * @notice Permanently stores Merkle roots of VeriCity repair record hash-chains with timestamps.
 */
contract ResolutionAnchor {
    struct Anchor {
        bytes32 merkleRoot;
        uint256 timestamp;
        uint256 totalRecords;
    }

    Anchor[] public anchors;
    address public owner;

    event MerkleRootAnchored(
        bytes32 indexed merkleRoot,
        uint256 timestamp,
        uint256 totalRecords,
        uint256 indexed anchorIndex
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can anchor roots");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Stores a Merkle root and record count permanently with current block timestamp.
     * @param _merkleRoot The root hash of the Merkle tree formed by repair record hashes.
     * @param _totalRecords The total number of repair records included in this anchor.
     */
    function anchorMerkleRoot(bytes32 _merkleRoot, uint256 _totalRecords) external onlyOwner {
        require(_merkleRoot != bytes32(0), "Invalid empty root");
        
        anchors.push(Anchor({
            merkleRoot: _merkleRoot,
            timestamp: block.timestamp,
            totalRecords: _totalRecords
        }));

        emit MerkleRootAnchored(_merkleRoot, block.timestamp, _totalRecords, anchors.length - 1);
    }

    /**
     * @notice Returns total number of anchors recorded.
     */
    function getAnchorCount() external view returns (uint256) {
        return anchors.length;
    }

    /**
     * @notice Returns the latest anchored Merkle root and metadata.
     */
    function getLatestAnchor() external view returns (bytes32 merkleRoot, uint256 timestamp, uint256 totalRecords) {
        require(anchors.length > 0, "No anchors recorded yet");
        Anchor storage latest = anchors[anchors.length - 1];
        return (latest.merkleRoot, latest.timestamp, latest.totalRecords);
    }

    /**
     * @notice Returns anchor data for a given index.
     */
    function getAnchor(uint256 index) external view returns (bytes32 merkleRoot, uint256 timestamp, uint256 totalRecords) {
        require(index < anchors.length, "Index out of bounds");
        Anchor storage a = anchors[index];
        return (a.merkleRoot, a.timestamp, a.totalRecords);
    }

    /**
     * @notice Transfer ownership to another address (e.g. multisig or backend relayer).
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
