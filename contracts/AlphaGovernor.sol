//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract AlphaGovernor is Governor, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl, GovernorSettings {
    constructor(IVotes _token, TimelockController _timelock) 
        Governor("AlphaGovernor")
        GovernorSettings(1 , 45818, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    function votingDelay() public view override(GovernorSettings, IGovernor) returns (uint256) {
        return super.votingDelay(); // 1 day
    }

    function votingPeriod() public view override(GovernorSettings, IGovernor) returns (uint256) {
        return super.votingPeriod(); // 1 week
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    // The functions below are overrides required by Solidity.

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public
        override(Governor, IGovernor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function COUNTING_MODE() public pure override virtual returns (string memory) {
        return "support=bravo";
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /*
    *         IMPLEMENT
    *
    */
    function _countVote(uint256 proposalId, address account, uint8 support, uint256 weight) 
        internal 
        virtual 
        override 
    {

    }

    function _quorumReached(uint256 proposalId) 
        internal 
        view 
        virtual 
        override 
        returns (bool)
    {

    }

    function _voteSucceeded(uint256 proposalId) 
        internal 
        view 
        virtual 
        override 
        returns (bool)
    {

    }

    function hasVoted(uint256 proposalId, address account) 
        public 
        view 
        virtual 
        override 
        returns (bool)
    {

    }



    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}