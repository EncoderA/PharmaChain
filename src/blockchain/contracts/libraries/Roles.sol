// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Roles {

    mapping(address => bool) internal manufacturers;
    mapping(address => bool) internal distributors;
    mapping(address => bool) internal wholesalers;
    mapping(address => bool) internal admins;

    address[] internal manufacturerList;
    address[] internal distributorList;
    address[] internal wholesalerList;
    address[] internal adminList;

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

    modifier onlyAdmin() {
        require(admins[msg.sender], "NA");
        _;
    }

    
}
