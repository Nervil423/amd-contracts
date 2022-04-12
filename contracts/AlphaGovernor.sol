//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract AlphaGovernor is
    Governor,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    GovernorSettings
{
    //   proposalId => Votes
    mapping(uint256 => uint256) private _proposalTotalVotes;
    mapping(uint256 => uint256) private _proposalYesVotes;
    mapping(uint256 => uint256) private _proposalNoVotes;
    mapping(uint256 => uint256) private _proposalAbstainVotes;

    mapping(address => Voter) private _voter;

    struct Voter {
        //    ProposalId
        mapping(uint256 => bool) hasVoted;
        mapping(uint256 => uint256) votesOnProposal;
        mapping(uint256 => uint256) voteSupport;
    }

    constructor(IVotes _token, TimelockController _timelock)
        Governor("AlphaGovernor")
        GovernorSettings(0, 45818, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    function votingDelay()
        public
        view
        override(GovernorSettings, IGovernor)
        returns (uint256)
    {
        return super.votingDelay(); // 1 day
    }

    function votingPeriod()
        public
        view
        override(GovernorSettings, IGovernor)
        returns (uint256)
    {
        return super.votingPeriod(); // 1 week
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
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
        returns (uint256 votes)
    {
        return _getPastVotes(account, blockNumber);
    }

    function _getPastVotes(address account, uint256 blockNumber)
        internal
        view
        returns (uint256 votes)
    {
        return token.getPastVotes(account, blockNumber);
    }

    function getCurrentVotes(address account)
        public
        view
        returns (uint256 votes)
    {
        return token.getVotes(account);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function COUNTING_MODE()
        public
        pure
        virtual
        override
        returns (string memory)
    {
        return "support=bravo";
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /*
     *         IMPLEMENT
     *
     */

    function proposalVotes(uint256 proposalId)
        public
        view
        returns (
            uint256 totalVotes,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 abstainVotes
        )
    {
        return (
            _proposalTotalVotes[proposalId],
            _proposalYesVotes[proposalId],
            _proposalNoVotes[proposalId],
            _proposalAbstainVotes[proposalId]
        );
    }

    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight
    ) internal virtual override {
        require(support == 0 || support == 1 || support == 2, "Invalid support type");
        require(weight > 0, "Must have weight behind vote");

        // Changing Vote
        if (_voter[account].hasVoted[proposalId]) {
            if        (_voter[account].voteSupport[proposalId] == 0) {
                _proposalYesVotes[proposalId] -= weight;
            } else if (_voter[account].voteSupport[proposalId] == 1) {
                _proposalNoVotes[proposalId] -= weight;
            } else if (_voter[account].voteSupport[proposalId] == 2) {
                _proposalAbstainVotes[proposalId] -= weight;
            }
            _proposalTotalVotes[proposalId] -= weight;
        }

        // Voted Yes
        if (support == 0) {
            _proposalTotalVotes[proposalId] += weight;
            _proposalYesVotes[proposalId] += weight;
            _voter[account].voteSupport[proposalId] = 0;
        }
        // Voted No
        else if (support == 1) {
            _proposalTotalVotes[proposalId] += weight;
            _proposalNoVotes[proposalId] += weight;
            _voter[account].voteSupport[proposalId] = 1;
        }
        // Abstained from Voting
        else if (support == 2) {
            _proposalTotalVotes[proposalId] += weight;
            _proposalAbstainVotes[proposalId] += weight;
            _voter[account].voteSupport[proposalId] = 2;
        }

        _voter[account].votesOnProposal[proposalId] += weight;
        _voter[account].hasVoted[proposalId] = true;
        _voter[account].votesOnProposal[proposalId] = weight;
    }

    function _quorumReached(uint256 proposalId)
        internal
        view
        virtual
        override
        returns (bool)
    {}

    function _voteSucceeded(uint256 proposalId)
        internal
        view
        virtual
        override
        returns (bool)
    {}

    function hasVoted(uint256 proposalId, address account)
        public
        view
        virtual
        override
        returns (bool)
    {}

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
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
