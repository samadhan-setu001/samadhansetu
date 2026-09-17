// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OfficerReputation
 * @notice Permanent, append-only on-chain ledger for municipal officer performance scores.
 * All nightly score recalculations are appended and cannot be overwritten or deleted.
 */
contract OfficerReputation {
    struct ScoreRecord {
        uint256 scoreBasisPoints; // Score * 100 (e.g., 85.50 -> 8550)
        uint256 timestamp;
        string scoreFormatted;    // e.g. "85.50"
    }

    // Mapping: officerId (e.g. "OFF-1042") => append-only array of historical scores
    mapping(string => ScoreRecord[]) private officerHistory;
    string[] private officerIds;
    mapping(string => bool) private exists;

    address public owner;

    event ScoreUpdated(
        string indexed officerId,
        uint256 scoreBasisPoints,
        string scoreFormatted,
        uint256 timestamp,
        uint256 indexed updateIndex
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can record scores");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Records a single officer's nightly score update.
     * @param _officerId The unique officer code, e.g. "OFF-1042".
     * @param _scoreBasisPoints The numerical score scaled by 100 (0 to 10000).
     * @param _scoreFormatted Human-readable string representation, e.g. "85.50".
     */
    function recordScore(
        string calldata _officerId,
        uint256 _scoreBasisPoints,
        string calldata _scoreFormatted
    ) external onlyOwner {
        require(bytes(_officerId).length > 0, "Officer ID cannot be empty");
        require(_scoreBasisPoints <= 10000, "Score cannot exceed 100.00%");

        if (!exists[_officerId]) {
            officerIds.push(_officerId);
            exists[_officerId] = true;
        }

        officerHistory[_officerId].push(ScoreRecord({
            scoreBasisPoints: _scoreBasisPoints,
            timestamp: block.timestamp,
            scoreFormatted: _scoreFormatted
        }));

        emit ScoreUpdated(
            _officerId,
            _scoreBasisPoints,
            _scoreFormatted,
            block.timestamp,
            officerHistory[_officerId].length - 1
        );
    }

    /**
     * @notice Records multiple officer scores in a single batch transaction.
     */
    function recordScoresBatch(
        string[] calldata _officerIds,
        uint256[] calldata _scoresBasisPoints,
        string[] calldata _scoreFormattedList
    ) external onlyOwner {
        uint256 len = _officerIds.length;
        require(len == _scoresBasisPoints.length && len == _scoreFormattedList.length, "Array lengths mismatch");

        for (uint256 i = 0; i < len; i++) {
            string calldata id = _officerIds[i];
            uint256 score = _scoresBasisPoints[i];
            string calldata formatted = _scoreFormattedList[i];

            require(bytes(id).length > 0, "Officer ID cannot be empty");
            require(score <= 10000, "Score cannot exceed 100.00%");

            if (!exists[id]) {
                officerIds.push(id);
                exists[id] = true;
            }

            officerHistory[id].push(ScoreRecord({
                scoreBasisPoints: score,
                timestamp: block.timestamp,
                scoreFormatted: formatted
            }));

            emit ScoreUpdated(
                id,
                score,
                formatted,
                block.timestamp,
                officerHistory[id].length - 1
            );
        }
    }

    /**
     * @notice Returns the full chronological history of score updates for an officer.
     */
    function getOfficerHistory(string calldata _officerId) external view returns (ScoreRecord[] memory) {
        return officerHistory[_officerId];
    }

    /**
     * @notice Returns total number of updates recorded for an officer.
     */
    function getOfficerUpdateCount(string calldata _officerId) external view returns (uint256) {
        return officerHistory[_officerId].length;
    }

    /**
     * @notice Returns the latest recorded score for an officer.
     */
    function getLatestScore(string calldata _officerId) external view returns (
        uint256 scoreBasisPoints,
        uint256 timestamp,
        string memory scoreFormatted
    ) {
        ScoreRecord[] storage records = officerHistory[_officerId];
        require(records.length > 0, "No records found for officer");
        ScoreRecord storage latest = records[records.length - 1];
        return (latest.scoreBasisPoints, latest.timestamp, latest.scoreFormatted);
    }

    /**
     * @notice Returns the total count of registered officers.
     */
    function getTotalOfficers() external view returns (uint256) {
        return officerIds.length;
    }

    /**
     * @notice Transfer contract ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
