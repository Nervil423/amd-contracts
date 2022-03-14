//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract AMDtimelock is TimelockController {
    uint256 minDelay = 50;
    address[] proposers;
    address[] executors;


    constructor() TimelockController(50, proposers, executors) {

    }

}