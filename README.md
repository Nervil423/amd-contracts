## Alpha Mecha DAO Smart Contracts

Currently functionality support the tests performed in  tests/AlphaGovernor.js

## Completed Functionality 
These features are have not undergone gas optimizations and auditing
* starts with mint disabled
* can enable mint
* whitelists addresses
* batch whitelists multiple addresses
* Fails if not enough money sent
* Mints an NFT to ur wallet for 3 AVAX (43ms)
* Gives you ownership of the NFT
* Vote delegated after minting
* NFT holder has 1 vote
* Allows you to delegate to other people (addr1) (78ms)
* Gave the vote to addr1
* Addr1 has two votes
* Redelegating works (105ms)
* Creates a proposal (42ms)
* Casts a vote on the proposal
* Casted a yes vote
* Casts a no vote (121ms)
* Casts an abstain vote (111ms)

## Upcoming Functionality
* Multiple votes cast at once
* Voting Quorum must be reached
* If yes then proposal is queued for execution
* If no then proposal is rejected
* Governor executes proposal after voting consensus
* Previously approved proposals can be reused with different numbers
* Proposals can change the underlying settings of the Governor
