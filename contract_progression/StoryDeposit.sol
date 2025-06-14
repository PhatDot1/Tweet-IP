// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IP_Deposit {
    address public owner;

    /// @notice Logs IP deposits! Backend listens to this event.
    /// @param ipAmount Amount deposited (in wei).
    /// @param depositor Who deposited.
    /// @param recipient Where IP should go.
    /// @param validation Arbitrary validation string.
    /// @param proof Extra validation data (bytes).
    /// @param handle User’s handle (e.g. Twitter).
    /// @param tweet Associated tweet text.
    event DepositProcessed(
        uint256 indexed ipAmount,
        address indexed depositor,
        address indexed recipient,
        string validation,
        bytes proof,
        string handle,
        string tweet
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /// @notice Sets deployer as owner.
    constructor() {
        owner = msg.sender;
    }

    /// @notice Users deposit native IP token—backend watches for this event.
    /// @param recipient Where IP should go.
    /// @param validation Off-chain validation tag.
    /// @param proof On-chain proof blob.
    /// @param handle User’s social handle.
    /// @param tweet User’s tweet content.
    function depositIP(
        address recipient,
        string calldata validation,
        bytes calldata proof,
        string calldata handle,
        string calldata tweet
    ) external payable {
        require(msg.value > 0, "Must send IP");
        require(recipient != address(0), "Invalid recipient");

        emit DepositProcessed(
            msg.value,
            msg.sender,
            recipient,
            validation,
            proof,
            handle,
            tweet
        );
    }

    /// @notice Owner can withdraw any stuck IP.
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }

    /// @notice Fallback to accept bare IP transfers.
    receive() external payable {}
}
