// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/Roles.sol";

contract Admin is Roles {

    error InvalidAddress();
    error AlreadyRegistered();
    error NotRegistered();
    error CannotRemoveSelf();

    constructor() {
        admins[msg.sender] = true;
        adminList.push(msg.sender);
    }

    /* =========================================================
                            ADMIN MANAGEMENT
    ========================================================= */

    function addAdmin(address _addr) external onlyAdmin {
        if (_addr == address(0)) revert InvalidAddress();
        if (admins[_addr]) revert AlreadyRegistered();

        admins[_addr] = true;
        adminList.push(_addr);
    }

    function removeAdmin(address _addr) external onlyAdmin {
        if (_addr == msg.sender) revert CannotRemoveSelf();
        if (!admins[_addr]) revert NotRegistered();

        admins[_addr] = false;
        _removeFromArray(adminList, _addr);
    }

    /* =========================================================
                        MANUFACTURER MANAGEMENT
    ========================================================= */

    function addManufacturer(address _addr) external onlyAdmin {
        if (_addr == address(0)) revert InvalidAddress();
        if (manufacturers[_addr]) revert AlreadyRegistered();

        manufacturers[_addr] = true;
        manufacturerList.push(_addr);
    }

    function removeManufacturer(address _addr) external onlyAdmin {
        if (!manufacturers[_addr]) revert NotRegistered();

        manufacturers[_addr] = false;
        _removeFromArray(manufacturerList, _addr);
    }

    // ✅ Manufacturer self-registration
    function registerAsManufacturer() external {
        if (manufacturers[msg.sender])
            revert AlreadyRegistered();

        manufacturers[msg.sender] = true;
        manufacturerList.push(msg.sender);
    }

    /* =========================================================
                    MANUFACTURER ADDS PARTICIPANTS
    ========================================================= */

    function addDistributor(address _addr)
        external
        onlyManufacturer
    {
        if (_addr == address(0)) revert InvalidAddress();
        if (distributors[_addr]) revert AlreadyRegistered();

        distributors[_addr] = true;
        distributorList.push(_addr);

        registeredUnder[_addr] = msg.sender;
        manufacturerDistributors[msg.sender].push(_addr);
    }

    function removeDistributor(address _addr)
        external
        onlyManufacturer
    {
        if (!distributors[_addr]) revert NotRegistered();
        if (registeredUnder[_addr] != msg.sender) revert NotRegistered();

        distributors[_addr] = false;
        _removeFromArray(distributorList, _addr);
        _removeFromArray(manufacturerDistributors[msg.sender], _addr);
        delete registeredUnder[_addr];
    }

    function addWholesaler(address _addr)
        external
        onlyManufacturer
    {
        if (_addr == address(0)) revert InvalidAddress();
        if (wholesalers[_addr]) revert AlreadyRegistered();

        wholesalers[_addr] = true;
        wholesalerList.push(_addr);

        registeredUnder[_addr] = msg.sender;
        manufacturerWholesalers[msg.sender].push(_addr);
    }

    function removeWholesaler(address _addr)
        external
        onlyManufacturer
    {
        if (!wholesalers[_addr]) revert NotRegistered();
        if (registeredUnder[_addr] != msg.sender) revert NotRegistered();

        wholesalers[_addr] = false;
        _removeFromArray(wholesalerList, _addr);
        _removeFromArray(manufacturerWholesalers[msg.sender], _addr);
        delete registeredUnder[_addr];
    }

    /* =========================================================
        MANUFACTURER VIEW FUNCTIONS
========================================================= */

function getMyDistributors()
    external
    view
    onlyManufacturer
    returns (address[] memory)
{
    return manufacturerDistributors[msg.sender];
}

function getMyWholesalers()
    external
    view
    onlyManufacturer
    returns (address[] memory)
{
    return manufacturerWholesalers[msg.sender];
}

    /* =========================================================
                        ADMIN CAN REMOVE ANYONE
    ========================================================= */

    function removeParticipant(address _addr)
        external
        onlyAdmin
    {
        if (manufacturers[_addr]) {
            manufacturers[_addr] = false;
            _removeFromArray(manufacturerList, _addr);
        }
        else if (distributors[_addr]) {
            distributors[_addr] = false;
            _removeFromArray(distributorList, _addr);
        }
        else if (wholesalers[_addr]) {
            wholesalers[_addr] = false;
            _removeFromArray(wholesalerList, _addr);
        }
        else {
            revert NotRegistered();
        }
    }

    function getAllParticipants()
        external
        view
        onlyAdmin
        returns (
            address[] memory _admins,
            address[] memory _manufacturers,
            address[] memory _distributors,
            address[] memory _wholesalers
        )
    {
        return (adminList, manufacturerList, distributorList, wholesalerList);
    }

    function _removeFromArray(address[] storage arr, address account) internal {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == account) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }
}