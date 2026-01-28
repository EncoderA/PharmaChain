// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/Roles.sol";

contract Admin is Roles {

    /* ---------------- EVENTS ---------------- */
    event ManufacturerAdded(address indexed account);
    event ManufacturerRemoved(address indexed account);

    event DistributorAdded(address indexed account);
    event DistributorRemoved(address indexed account);

    event WholesalerAdded(address indexed account);
    event WholesalerRemoved(address indexed account);

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    constructor() {
        admins[msg.sender] = true;
        adminList.push(msg.sender);
        emit AdminAdded(msg.sender);
    }

    /* ---------------- INTERNAL REMOVE HELPER ---------------- */
    function _removeFromArray(address[] storage arr, address account) internal {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == account) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }

    /* ---------------- MANUFACTURER ---------------- */
    function addManufacturer(address _addr) external onlyAdmin {
        require(_addr != address(0), "InAdd");
        require(!manufacturers[_addr], "AlM");

        manufacturers[_addr] = true;
        manufacturerList.push(_addr);

        emit ManufacturerAdded(_addr);
    }

    function removeManufacturer(address _addr) external onlyAdmin {
        require(manufacturers[_addr], "NM");

        manufacturers[_addr] = false;
        _removeFromArray(manufacturerList, _addr);

        emit ManufacturerRemoved(_addr);
    }

    function getManufacturers() external view returns (address[] memory) {
        return manufacturerList;
    }

    /* ---------------- DISTRIBUTOR ---------------- */
    function addDistributor(address _addr) external onlyAdmin {
        require(_addr != address(0), "InAdd");
        require(!distributors[_addr], "AlD");

        distributors[_addr] = true;
        distributorList.push(_addr);

        emit DistributorAdded(_addr);
    }

    function removeDistributor(address _addr) external onlyAdmin {
        require(distributors[_addr], "ND");

        distributors[_addr] = false;
        _removeFromArray(distributorList, _addr);

        emit DistributorRemoved(_addr);
    }

    function getDistributors() external view returns (address[] memory) {
        return distributorList;
    }

    /* ---------------- WHOLESALER ---------------- */
    function addWholesaler(address _addr) external onlyAdmin {
        require(_addr != address(0), "InAdd");
        require(!wholesalers[_addr], "AlW");

        wholesalers[_addr] = true;
        wholesalerList.push(_addr);

        emit WholesalerAdded(_addr);
    }

    function removeWholesaler(address _addr) external onlyAdmin {
        require(wholesalers[_addr], "NW");

        wholesalers[_addr] = false;
        _removeFromArray(wholesalerList, _addr);

        emit WholesalerRemoved(_addr);
    }

    function getWholesalers() external view returns (address[] memory) {
        return wholesalerList;
    }

    /* ---------------- ADMIN ---------------- */
    function addAdmin(address _addr) external onlyAdmin {
        require(_addr != address(0), "InAdd");
        require(!admins[_addr], "AlA");

        admins[_addr] = true;
        adminList.push(_addr);

        emit AdminAdded(_addr);
    }

    function removeAdmin(address _addr) external onlyAdmin {
        require(_addr != msg.sender, "Canntrmself");
        require(admins[_addr], "NA");

        admins[_addr] = false;
        _removeFromArray(adminList, _addr);

        emit AdminRemoved(_addr);
    }

    function getAdmins() external view returns (address[] memory) {
        return adminList;
    }
}
