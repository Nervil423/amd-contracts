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

    // Test cases

    //////////////////////////////
    //       Constructor 
    //////////////////////////////
    describe("Deployment", function () {
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
        afterEach(async function() {
            //console.log(ethers.utils.formatUnits((await owner.getBalance()).toString()));
        });



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
            expect(await this.nft.ownerOf(events[events.length - 1].args[1])).to.equal(owner.address);
        });
        


    });
    describe("Delegating", function () {
        const display = 0;
        // Just to check stuff
        before(async function () {
            if (display) {
                console.log("Before");
                console.log({
                    Owner: owner.address,
                    OwnerNFTcnt: (await this.nft.balanceOf(owner.address)).toString(),
                    OwnerGovVotes: (await this.governor.getCurrentVotes(owner.address)).toString(),
                    OwnerNFTVotes: (await this.nft.getVotes(owner.address)).toString(),
                    OwnerDelegatedVotesTo: await this.nft.delegates(owner.address)
                })
            }
        });
        afterEach(async function () {
            if (display) {
                console.log({
                    Owner: owner.address,
                    OwnerNFTcnt: (await this.nft.balanceOf(owner.address)).toString(),
                    OwnerGovVotes: (await this.governor.getCurrentVotes(owner.address)).toString(),
                    OwnerNFTVotes: (await this.nft.getVotes(owner.address)).toString(),
                    OwnerDelegatedVotesTo: await this.nft.delegates(owner.address)
                })
            }
        });
        
        
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
        })

        /*
        it(`Delegate voting power to yourself`, async function () {
            await this.nft.delegate(owner.address);
            expect(await this.nft.delegates(owner.address)).to.equal(owner.address)
        });
        

        it(`Returns delegate back to yourself`, async function () {
            await this.nft.delegate(owner.address);
            expect(await this.nft.delegates(owner.address)).to.equal(owner.address);
        });

        it(`Gives you 1 vote after delegation from governor`, async function () {
            const blockNumber = await provider.getBlockNumber() - 1;
            expect(await this.governor.getVotes(owner.address, blockNumber)).to.equal(1);
        });

        it(`Gives you 1 vote after delegation from nft`, async function () {
            const blockNumber = await provider.getBlockNumber() - 1;
            expect(await this.governor.getVotes(owner.address, blockNumber)).to.equal(1);
        });
        */
    });

    //////////////////////////////
    //  setRemainderDestination 
    ////////////////////////////// 0x6352211e0000000000000000000000000000000000000000000000000000000000000003
    /*
    describe("otherMethod", function () {

    });
    */
});