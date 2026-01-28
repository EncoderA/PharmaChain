// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./structs/DrugStruct.sol";
import "./roles/Admin.sol";

contract SupplyChain is Admin {

    // ================= ERRORS (GAS OPTIMIZED) =================
    error DrugExpired();
    error InvalidStage();
    error NotAuthorized();
    error NotOwner();
    error AlreadyRequested();
    error AlreadyApproved();
    error NoRequest();
    error Rejected();

    // ================= STATE =================
    uint256 public drugCounter;

    mapping(uint256 => Drug) public drugs;
    mapping(uint256 => address[]) public ownershipHistory;

    // ================= MODIFIER =================
    modifier notExpired(uint256 _drugId) {
        if (block.timestamp > drugs[_drugId].expiryDate) revert DrugExpired();
        _;
    }

    // ================= REQUEST STRUCTS =================
    struct DistributorRequest {
        address distributor;
        bool approved;
    }

    struct WholesalerRequest {
        address wholesaler;
        bool approved;
    }

    mapping(uint256 => DistributorRequest) public distributorRequests;
    mapping(uint256 => WholesalerRequest) public wholesalerRequests;

    // ================= VIEW STRUCTS =================
    struct DistributorRequestView {
        uint256 drugId;
        string name;
        address distributor;
        bool approved;
    }

    struct WholesalerRequestView {
        uint256 drugId;
        string name;
        address wholesaler;
        bool approved;
    }

    // ================= EVENTS =================
    event DrugRegistered(uint256 indexed drugId);
    event StageUpdated(uint256 indexed drugId, Stage stage);
    event DrugRejected(uint256 indexed drugId, address indexed rejectedBy);
    event DrugRequested(uint256 indexed drugId, address indexed distributor);
    event DrugTransferred(uint256 indexed drugId, address indexed distributor);
    event DrugRequestedByWholesaler(uint256 indexed drugId, address indexed wholesaler);
    event DrugTransferredToWholesaler(uint256 indexed drugId, address indexed wholesaler);
    event DrugBroadcastedToWholesalers(uint256 indexed drugId);

    // =========================================================
    // ================= MANUFACTURER ==========================
    // =========================================================

    function registerDrug(
    string calldata _name,
    uint64 _manufacturingDate,
    uint64 _expiryDate,
    bytes32 _qrHash
) external onlyManufacturer {

    if (_expiryDate <= _manufacturingDate) revert InvalidStage();

    unchecked { ++drugCounter; }

    drugs[drugCounter] = Drug({
        drugId: drugCounter,
        name: _name,
        manufacturingDate: _manufacturingDate,
        expiryDate: _expiryDate,
        manufacturer: msg.sender,
        currentOwner: msg.sender,
        stage: Stage.Manufactured,
        isRejected: false,
        customerName: "",
        qrHash: _qrHash
    });

    ownershipHistory[drugCounter].push(msg.sender);
    emit DrugRegistered(drugCounter);
}


    function getAllDistributorRequests()
        external
        view
        onlyManufacturer
        returns (DistributorRequestView[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            if (distributorRequests[i].distributor != address(0)) count++;
            unchecked { ++i; }
        }

        DistributorRequestView[] memory result =
            new DistributorRequestView[](count);

        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            DistributorRequest storage req = distributorRequests[i];
            if (req.distributor != address(0)) {
                result[index++] = DistributorRequestView({
                    drugId: i,
                    name: drugs[i].name,
                    distributor: req.distributor,
                    approved: req.approved
                });
            }
            unchecked { ++i; }
        }

        return result;
    }

    function approveDistributor(uint256 _drugId)
        external
        onlyManufacturer
        notExpired(_drugId)
    {
        DistributorRequest storage req = distributorRequests[_drugId];
        Drug storage drug = drugs[_drugId];

        if (req.distributor == address(0)) revert NoRequest();
        if (req.approved) revert AlreadyApproved();
        if (drug.manufacturer != msg.sender) revert NotAuthorized();
        if (drug.stage != Stage.Manufactured) revert InvalidStage();

        drug.currentOwner = req.distributor;
        drug.stage = Stage.Distributed;

        ownershipHistory[_drugId].push(req.distributor);

        emit DrugTransferred(_drugId, req.distributor);
        emit StageUpdated(_drugId, Stage.Distributed);

        delete distributorRequests[_drugId];
    }

    function getMyDrugs()
        external
        view
        onlyManufacturer
        returns (Drug[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (d.manufacturer == msg.sender && d.currentOwner == msg.sender) count++;
            unchecked { ++i; }
        }

        Drug[] memory result = new Drug[](count);
        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (d.manufacturer == msg.sender && d.currentOwner == msg.sender) {
                result[index++] = d;
            }
            unchecked { ++i; }
        }

        return result;
    }

    // =========================================================
    // ================= DISTRIBUTOR ===========================
    // =========================================================

    function getAvailableDrugsForDistributor()
        external
        view
        onlyDistributor
        returns (Drug[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (d.stage == Stage.Manufactured && !d.isRejected) count++;
            unchecked { ++i; }
        }

        Drug[] memory result = new Drug[](count);
        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (d.stage == Stage.Manufactured && !d.isRejected) {
                result[index++] = d;
            }
            unchecked { ++i; }
        }

        return result;
    }

    function requestDrug(uint256 _drugId) external onlyDistributor {
        if (distributorRequests[_drugId].distributor != address(0))
            revert AlreadyRequested();

        if (drugs[_drugId].stage != Stage.Manufactured)
            revert InvalidStage();

        distributorRequests[_drugId] =
            DistributorRequest(msg.sender, false);

        emit DrugRequested(_drugId, msg.sender);
    }

    function getAvailableDrugsForWholesaler()
        external
        view
        onlyDistributor
        returns (Drug[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (
                d.stage == Stage.Distributed &&
                d.currentOwner == msg.sender &&
                !d.isRejected
            ) count++;
            unchecked { ++i; }
        }

        Drug[] memory result = new Drug[](count);
        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (
                d.stage == Stage.Distributed &&
                d.currentOwner == msg.sender &&
                !d.isRejected
            ) {
                result[index++] = d;
            }
            unchecked { ++i; }
        }

        return result;
    }

    function getWholesalerRequests()
        external
        view
        onlyDistributor
        returns (WholesalerRequestView[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            if (wholesalerRequests[i].wholesaler != address(0)) count++;
            unchecked { ++i; }
        }

        WholesalerRequestView[] memory result =
            new WholesalerRequestView[](count);

        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            WholesalerRequest storage req = wholesalerRequests[i];
            if (req.wholesaler != address(0)) {
                result[index++] = WholesalerRequestView({
                    drugId: i,
                    name: drugs[i].name,
                    wholesaler: req.wholesaler,
                    approved: req.approved
                });
            }
            unchecked { ++i; }
        }

        return result;
    }

    function approveWholesaler(uint256 _drugId)
        external
        onlyDistributor
        notExpired(_drugId)
    {
        WholesalerRequest storage req = wholesalerRequests[_drugId];
        Drug storage drug = drugs[_drugId];

        if (req.wholesaler == address(0)) revert NoRequest();
        if (req.approved) revert AlreadyApproved();
        if (drug.currentOwner != msg.sender) revert NotOwner();
        if (drug.stage != Stage.Distributed) revert InvalidStage();

        drug.currentOwner = req.wholesaler;
        drug.stage = Stage.Wholesaled;

        ownershipHistory[_drugId].push(req.wholesaler);

        emit DrugTransferredToWholesaler(_drugId, req.wholesaler);
        emit StageUpdated(_drugId, Stage.Wholesaled);

        delete wholesalerRequests[_drugId];
    }

    function sendDrugToAllWholesalers(uint256 _drugId)
        external
        onlyDistributor
        notExpired(_drugId)
    {
        Drug storage drug = drugs[_drugId];

        if (drug.stage != Stage.Distributed) revert InvalidStage();
        if (drug.currentOwner != msg.sender) revert NotOwner();
        if (drug.isRejected) revert Rejected();

        emit DrugBroadcastedToWholesalers(_drugId);
    }

    // =========================================================
    // ================= WHOLESALER ============================
    // =========================================================

    function viewBroadcastedDrugs()
    external
    view
    onlyWholesaler
    returns (Drug[] memory)
{
    uint256 counter = drugCounter;
    uint256 count;

    // First pass: count broadcasted drugs
    for (uint256 i = 1; i <= counter; ) {
        Drug storage d = drugs[i];
        if (
            d.stage == Stage.Distributed &&
            !d.isRejected
        ) {
            count++;
        }
        unchecked { ++i; }
    }

    Drug[] memory result = new Drug[](count);
    uint256 index;

    // Second pass: populate result
    for (uint256 i = 1; i <= counter; ) {
        Drug storage d = drugs[i];
        if (
            d.stage == Stage.Distributed &&
            !d.isRejected
        ) {
            result[index++] = d;
        }
        unchecked { ++i; }
    }

    return result;
}


    function requestDrugFromDistributor(uint256 _drugId)
        external
        onlyWholesaler
    {
        if (wholesalerRequests[_drugId].wholesaler != address(0))
            revert AlreadyRequested();

        Drug storage drug = drugs[_drugId];

        if (drug.stage != Stage.Distributed) revert InvalidStage();
        if (drug.isRejected) revert Rejected();

        wholesalerRequests[_drugId] =
            WholesalerRequest(msg.sender, false);

        emit DrugRequestedByWholesaler(_drugId, msg.sender);
    }

    function getMyWholesalerDrugs()
        external
        view
        onlyWholesaler
        returns (Drug[] memory)
    {
        uint256 counter = drugCounter;
        uint256 count;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (
                d.currentOwner == msg.sender &&
                d.stage == Stage.Wholesaled &&
                !d.isRejected
            ) count++;
            unchecked { ++i; }
        }

        Drug[] memory result = new Drug[](count);
        uint256 index;

        for (uint256 i = 1; i <= counter; ) {
            Drug storage d = drugs[i];
            if (
                d.currentOwner == msg.sender &&
                d.stage == Stage.Wholesaled &&
                !d.isRejected
            ) {
                result[index++] = d;
            }
            unchecked { ++i; }
        }

        return result;
    }

    function sellToCustomer(
    uint256 _drugId,
    string calldata _customerName
)
    external
    onlyWholesaler
    notExpired(_drugId)
{
    Drug storage drug = drugs[_drugId];

    if (drug.stage != Stage.Wholesaled) revert InvalidStage();
    if (drug.currentOwner != msg.sender) revert NotOwner();
    if (drug.isRejected) revert Rejected();

    // Mark as sold (no wallet required)
    drug.currentOwner = address(0);
    drug.stage = Stage.Sold;
    drug.customerName = _customerName;

    ownershipHistory[_drugId].push(address(0));
    emit StageUpdated(_drugId, Stage.Sold);
}


    // =========================================================
    // ================= COMMON ================================
    // =========================================================

    function verifyDrugByQR(
    uint256 _drugId,
    bytes32 _scannedHash
)
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

    // Drug does not exist
    if (drug.drugId == 0) {
        return (false, false, false, Stage.Manufactured, address(0));
    }

    bool expired = block.timestamp > drug.expiryDate;

    bool authentic =
        drug.qrHash == _scannedHash &&
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

    
    function rejectDrug(uint256 _drugId) external {
        if (!distributors[msg.sender] && !wholesalers[msg.sender])
            revert NotAuthorized();

        drugs[_drugId].isRejected = true;
        emit DrugRejected(_drugId, msg.sender);
    }

    function verifyDrug(uint256 _drugId)
        external
        view
        returns (
            bool isValid,
            uint256 drugId,
            string memory name,
            address manufacturer,
            address currentOwner,
            Stage stage,
            bool isExpired,
            bool isRejected
        )
    {
        Drug storage drug = drugs[_drugId];

        if (drug.drugId == 0)
            return (false, 0, "", address(0), address(0), Stage.Manufactured, false, false);

        bool expired = block.timestamp > drug.expiryDate;
        bool valid = !expired && !drug.isRejected;

        return (
            valid,
            drug.drugId,
            drug.name,
            drug.manufacturer,
            drug.currentOwner,
            drug.stage,
            expired,
            drug.isRejected
        );
    }
}