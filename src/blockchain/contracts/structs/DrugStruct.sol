// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

enum Stage {
    Manufactured,
    Distributed,
    Wholesaled,
    Sold
}

struct Drug {
    uint256 drugId;
    address manufacturer;
    address currentOwner;
    uint64 manufacturingDate;
    uint64 expiryDate;
    Stage stage;
    bool isRejected;
    string name;
    bytes32 qrHash;   // 🔥 Auto-generated
}