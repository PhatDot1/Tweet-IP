// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IP_Deposit {
    address public owner;

    struct LicenseTerms {
        bool aiTrainingAllowed;
        bool commercialUse;
        bool attributionRequired;
        bool remixingAllowed;
        uint256 expiration;
        uint256 licensingFee;
    }

    struct CoCreator {
        string name;
        address wallet;
    }

    /// @notice Logs IP deposits for Story Protocol registration.
    /// @param ipAmount Amount deposited (in wei).
    /// @param depositor Who deposited.
    /// @param recipient Where IP should go.
    /// @param validation Off-chain validation tag.
    /// @param proof Extra validation data (bytes).
    /// @param handle User’s handle (e.g. Twitter).
    /// @param tweet Associated tweet text.
    /// @param metadataURI URI of the metadata.
    /// @param licenseTerms Struct of license configuration.
    /// @param coCreators Array of co-creators with names and wallets.
    event DepositProcessed(
        uint256 indexed ipAmount,
        address indexed depositor,
        address indexed recipient,
        string validation,
        bytes proof,
        string handle,
        string tweet,
        string metadataURI,
        LicenseTerms licenseTerms,
        CoCreator[] coCreators
    );

    event ValidationUpdated(bytes32 indexed txHash, string newValidation);

    mapping(bytes32 => string) public validationFor;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function depositIP(
        address recipient,
        string calldata validation,
        bytes calldata proof,
        string calldata handle,
        string calldata tweet,
        string calldata metadataURI,
        LicenseTerms calldata licenseTerms,
        CoCreator[] calldata coCreators
    ) external payable {
        require(msg.value > 0, "Must send IP");
        require(recipient != address(0), "Invalid recipient");

        bytes32 txHash = keccak256(
            abi.encodePacked(block.chainid, address(this), msg.sender, block.number, msg.value)
        );
        validationFor[txHash] = validation;

        emit DepositProcessed(
            msg.value,
            msg.sender,
            recipient,
            validation,
            proof,
            handle,
            tweet,
            metadataURI,
            licenseTerms,
            coCreators
        );
    }

    function updateValidation(bytes32 txHash, string calldata newValidation) external onlyOwner {
        validationFor[txHash] = newValidation;
        emit ValidationUpdated(txHash, newValidation);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
