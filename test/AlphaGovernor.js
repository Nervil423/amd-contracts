// test/Airdrop.js
// Load dependencies
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const Web3 = require('web3');

const { abi: govabi, bytecode: govbytecode } = require("../artifacts/contracts/AlphaGovernor.sol/AlphaGovernor.json");
const { abi: nftabi, bytecode: nftbytecode } = require("../artifacts/contracts/NFT.sol/NFT.json");
const { abi: timeabi, bytecode: timebytecode } = require("../artifacts/contracts/AMDtimelock.sol/AMDtimelock.json");



const OWNER_ADDRESS = ethers.utils.getAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

const DECIMALS = 2;

const AMT = 150;

///////////////////////////////////////////////////////////
// SEE https://hardhat.org/tutorial/testing-contracts.html
// FOR HELP WRITING TESTS
// USE https://github.com/gnosis/mock-contract FOR HELP
// WITH MOCK CONTRACT
///////////////////////////////////////////////////////////

async function calculateGasFee(tx, methodName) {
    const gasPrice = 470000000000;
    const weiPerAvax = Number('1000000000000000000');

    const txReceipt = await tx.wait();
    const gasUsed = txReceipt.gasUsed.toString()
    const avax = gasUsed * gasPrice / weiPerAvax;
    console.log(methodName, "gas used:", gasUsed);
    console.log(methodName, "AVAX cost:", avax);
}


// Start test block
describe('AlphaGovernor', function () {
    let owner;
    let addr1;
    let addr2;
    let addrs;
    const provider = ethers.provider;

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        this.NFT = new ethers.ContractFactory(nftabi, nftbytecode, owner);
        this.TIMELOCK = new ethers.ContractFactory(timeabi, timebytecode, owner);
        this.AlphaGovernor = new ethers.ContractFactory(govabi, govbytecode, owner);

        this.nft = await this.NFT.deploy();
        this.timelock = await this.TIMELOCK.deploy();
        this.governor = await this.AlphaGovernor.deploy(this.nft.address, this.timelock.address);

        const nftABI = new ethers.utils.Interface(nftabi);
        const timeABI = new ethers.utils.Interface(timeabi);
        const govABI = new ethers.utils.Interface(govabi);
    });

    beforeEach(async function () {
        //console.log(`Main signer: ${owner.address}`);


    });

    let newBlock = async function (nftcontract, signer) {
        let overrides = {
            value: ethers.utils.parseEther("3.0")
        }
        
        await nftcontract.connect(signer).mintAMD(overrides);
    }

    // Test cases

    //////////////////////////////
    //       Constructor 
    //////////////////////////////
    describe("Deployment", function () {
        afterEach(async function () {
            //console.log(await provider.getBlockNumber())
        })
        it(`Deploys the NFT Contract`, async function () {
            await this.nft.deployed();
            //console.log(this.nft.address)
        });
        it('Deploys the TIMELOCK Contract', async function () {
            await this.timelock.deployed();
        });
        it('Deploys the AlphaGovernor Contract', async function () {
            await this.governor.deployed();
        });
    });

    describe("NFT", function () {
        afterEach(async function () {
            //console.log(await provider.getBlockNumber())
        })
        it(`Fails if not enough money sent`, async function () {
            let overrides = {
                value: ethers.utils.parseEther("2.5")
            }
            
            await expect(this.nft.mintAMD(overrides)).to.be.reverted;
        });

        it('Mints an NFT to ur wallet for 3 AVAX', async function () {
            let overrides = {
                value: ethers.utils.parseEther("3.0")
            }
            
            await this.nft.mintAMD(overrides);
            expect(await this.nft.balanceOf(owner.address)).to.equal(1);
        });

        it('Gives you ownership of the NFT', async function () {
            const nftABI = new ethers.utils.Interface(nftabi);

            // I made an event and then just waited for the event to be broadcast to find tokenId.
            // You can also take the transaction hash immediately after sending the wait for the block
            // to be mined and executed to find the Id then

            // Could be faster?

            const [...events] = await this.nft.queryFilter("MintedAMD");
            expect(await this.nft.ownerOf(events[events.length - 1].args.tokenId)).to.equal(owner.address);
        });

        it('Vote delegated after minting', async function () {
            expect(await this.governor.getCurrentVotes(owner.address)).to.equal(1);
        });
        


    });
    describe("Delegating", function () {
        afterEach(async function () {
            //console.log(await provider.getBlockNumber())
        })
        it('NFT holder has 1 vote', async function () {
            expect(await this.governor.getCurrentVotes(owner.address)).to.equal(1);
        });

        it(`Allows you to delegate to other people (addr1)`, async function () {
            await this.nft.delegate(addr1.address);
            expect(await this.nft.delegates(owner.address)).to.equal(addr1.address);
        });

        it(`Gave the vote to addr1`, async function () {
            expect(await this.governor.getCurrentVotes(addr1.address)).to.equal(1)
        });
        it(`Addr1 has two votes`, async function () {
            let overrides = {
                value: ethers.utils.parseEther("3.0")
            }
            await this.nft.connect(addr1).mintAMD(overrides);
            expect(await this.governor.getCurrentVotes(addr1.address)).to.equal(2);
        });
        it('Redelegating works', async function () {
            await this.nft.delegate(owner.address);
            expect(await this.governor.getCurrentVotes(owner.address)).to.equal(await this.governor.getCurrentVotes(addr1.address))
        })

        after(async function () {

        });
    });

    describe("Proposals", function () {

        /*
         * Known vulnerability with different vote viewing mechanisms
         * I worked around the Checkpoints library with block number on the Votes.sol library
         * Need to make that align with the governor contract for it to be fully secure
         */
        it("Creates a proposal", async function () {
            // Proposal will make the governor mint an NFT

            const mintCallData = this.nft.interface.encodeFunctionData('mintAMD')
            

            await this.governor.propose(
                [this.nft.address],
                [3],
                [mintCallData],
                "Mint's an NFT to governor",
            );
            const [...events] = await this.governor.queryFilter("ProposalCreated");
            this.proposalId = BigNumber.from(events[events.length - 1].args.proposalId);

            // The state function should return 0 which means that the proposal is pending
            expect(await this.governor.state(this.proposalId)).to.equal(0);
        });
        it("Casts a vote on the proposal", async function () {
            await newBlock(this.nft, addrs[4])

            await this.governor.castVote(this.proposalId, 0);
            let votes = await this.governor.proposalVotes(this.proposalId);
            expect(votes.totalVotes.toNumber()).to.equal(1);
        });
        it("Casted a yes vote", async function () {
            let votes = await this.governor.proposalVotes(this.proposalId);
            expect(votes.yesVotes.toNumber()).to.equal(1);
        });
        it("Casts a no vote", async function () {

            await this.governor.castVote(this.proposalId, 1);
            let votes = await this.governor.proposalVotes(this.proposalId);
            expect(votes.noVotes.toNumber()).to.equal(1);
        })
        it("Casts an abstain vote", async function () {
            
            
            await this.governor.castVote(this.proposalId, 2);
            

            let votes = await this.governor.proposalVotes(this.proposalId);
            expect(votes.abstainVotes.toNumber()).to.equal(1);
        })
    });

    //////////////////////////////
    //  setRemainderDestination 
    ////////////////////////////// 
    /*
    describe("otherMethod", function () {

    });
    */
});