// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./structs/DrugStruct.sol";
import "./roles/Admin.sol";

contract SupplyChain is Admin {

    error NotOwner();
    error InvalidStage();
    error DrugExpired();
    error Rejected();
    error NotAuthorized();

    uint256 public drugCounter;

    mapping(uint256 => Drug) public drugs;
    mapping(uint256 => address[]) public ownershipHistory;

    modifier notExpired(uint256 _drugId) {
        if (block.timestamp > drugs[_drugId].expiryDate)
            revert DrugExpired();
        _;
    }

    /* =========================================================
                        MANUFACTURER
    ========================================================= */

    function registerDrug(
        string calldata _name,
        uint64 _manufacturingDate,
        uint64 _expiryDate
    ) external onlyManufacturer {

        if (_expiryDate <= _manufacturingDate)
            revert InvalidStage();

        unchecked { ++drugCounter; }

        // 🔥 AUTO-GENERATED QR HASH
        bytes32 generatedQR = keccak256(
            abi.encodePacked(
                drugCounter,
                msg.sender,
                _name,
                block.number
            )
        );

        drugs[drugCounter] = Drug({
            drugId: drugCounter,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            stage: Stage.Manufactured,
            isRejected: false,
            name: _name,
            qrHash: generatedQR
        });

        ownershipHistory[drugCounter].push(msg.sender);
    }

    function transferToDistributor(uint256 _drugId, address _distributor)
        external
        onlyManufacturer
        notExpired(_drugId)
    {
        Drug storage drug = drugs[_drugId];

        if (drug.currentOwner != msg.sender) revert NotOwner();
        if (!distributors[_distributor]) revert NotAuthorized();
        if (drug.stage != Stage.Manufactured) revert InvalidStage();
        if (drug.isRejected) revert Rejected();

        drug.currentOwner = _distributor;
        drug.stage = Stage.Distributed;

        ownershipHistory[_drugId].push(_distributor);
    }

    /* =========================================================
                        DISTRIBUTOR
    ========================================================= */

    function transferToWholesaler(uint256 _drugId, address _wholesaler)
        external
        onlyDistributor
        notExpired(_drugId)
    {
        Drug storage drug = drugs[_drugId];

        if (drug.currentOwner != msg.sender) revert NotOwner();
        if (!wholesalers[_wholesaler]) revert NotAuthorized();
        if (drug.stage != Stage.Distributed) revert InvalidStage();
        if (drug.isRejected) revert Rejected();

        drug.currentOwner = _wholesaler;
        drug.stage = Stage.Wholesaled;

        ownershipHistory[_drugId].push(_wholesaler);
    }

    /* =========================================================
                        WHOLESALER
    ========================================================= */

    function markAsSold(uint256 _drugId)
        external
        onlyWholesaler
        notExpired(_drugId)
    {
        Drug storage drug = drugs[_drugId];

        if (drug.currentOwner != msg.sender) revert NotOwner();
        if (drug.stage != Stage.Wholesaled) revert InvalidStage();
        if (drug.isRejected) revert Rejected();

        drug.stage = Stage.Sold;
        drug.currentOwner = address(0);

        ownershipHistory[_drugId].push(address(0));
    }

    /* =========================================================
                            COMMON
    ========================================================= */

    function rejectDrug(uint256 _drugId) external {
        if (
            !admins[msg.sender] &&
            !manufacturers[msg.sender] &&
            !distributors[msg.sender] &&
            !wholesalers[msg.sender]
        ) revert NotAuthorized();

        drugs[_drugId].isRejected = true;
    }

    function verifyDrugByQR(uint256 _drugId, bytes32 _scannedHash)
        external
        view
        returns (
            bool isAuthentic,
            bool isExpired,
            bool isRejected,
            Stage stage,
            address currentOwner
        )
    {
        Drug storage drug = drugs[_drugId];

        if (drug.drugId == 0)
            return (false, false, false, Stage.Manufactured, address(0));

        bool expired = block.timestamp > drug.expiryDate;

        bool authentic =
            (drug.qrHash == _scannedHash) &&
            !expired &&
            !drug.isRejected;

        return (
            authentic,
            expired,
            drug.isRejected,
            drug.stage,
            drug.currentOwner
        );
    }

    function getDrugJourney(uint256 _drugId)
        external
        view
        returns (address[] memory)
    {
        return ownershipHistory[_drugId];
    }

    function getDrugDetails(uint256 _drugId)
        external
        view
        returns (Drug memory)
    {
        return drugs[_drugId];
    }
}