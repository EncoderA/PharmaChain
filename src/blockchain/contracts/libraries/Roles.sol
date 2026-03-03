// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Roles {

    /* ================= ROLE MAPPINGS ================= */

    mapping(address => bool) internal admins;
    mapping(address => bool) internal manufacturers;
    mapping(address => bool) internal distributors;
    mapping(address => bool) internal wholesalers;

    /* ================= ROLE LISTS ================= */

    address[] internal adminList;
    address[] internal manufacturerList;
    address[] internal distributorList;
    address[] internal wholesalerList;

    /* ================= HIERARCHY ================= */

    mapping(address => address) internal registeredUnder;
    mapping(address => address[]) internal manufacturerDistributors;
    mapping(address => address[]) internal manufacturerWholesalers;

    /* ================= MODIFIERS ================= */

    modifier onlyAdmin() {
        require(admins[msg.sender], "NA");
        _;
    }

    modifier onlyManufacturer() {
        require(manufacturers[msg.sender], "NM");
        _;
    }

    modifier onlyDistributor() {
        require(distributors[msg.sender], "ND");
        _;
    }

    modifier onlyWholesaler() {
        require(wholesalers[msg.sender], "NW");
        _;
    }
}