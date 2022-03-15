// test/Airdrop.js
// Load dependencies
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const Web3 = require('web3');

const { abi: govabi,  bytecode: govbytecode  } = require("../artifacts/contracts/AlphaGovernor.sol/AlphaGovernor.json");
const { abi: nftabi,  bytecode: nftbytecode  } = require("../artifacts/contracts/NFT.sol/NFT.json");
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

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        this.NFT           = new ethers.ContractFactory(nftabi, nftbytecode, owner);
        this.TIMELOCK      = new ethers.ContractFactory(timeabi, timebytecode, owner);
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
        it('Mints an NFT to ur wallet', async function () {
            await this.nft.mintAMD(owner.address);
            expect(await this.nft.balanceOf(owner.address)).to.equal(1);
        });

        it('gives you ownership of the NFT', async function () {
            const nftABI = new ethers.utils.Interface(nftabi);


            // This will be the second nft minted by the ERC721 contract
            const minttx = await this.nft.mintAMD(owner.address);
            

            // I made an event and then just waited for the event to be broadcast to find tokenId.
            // You can also take the transaction hash immediately after sending the wait for the block
            // to be mined and executed to find the Id then

            const [...events] = await this.nft.queryFilter("MintedAMD");
            expect(
                events[events.length-1].args[1] // Fetch most recent tx that matches 'MintedAMD'
                ).to.equal(2)
        });

        it(`Allows you to delegate your vote to yourself`, async function () {
            await this.nft.mintAMD(owner.address);
            await this.nft.delegate(owner.address);
            expect(await this.nft.delegates(owner.address)).to.equal(owner.address)
        })
    });

    //////////////////////////////
    //  setRemainderDestination 
    ////////////////////////////// 0x6352211e0000000000000000000000000000000000000000000000000000000000000003
    /*
    describe("otherMethod", function () {

    });
    */
});