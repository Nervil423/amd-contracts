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
        
        this.NFT           = await ethers.getContractFactory("NFT");
        this.TIMELOCK      = new ethers.ContractFactory(timeabi, timebytecode, owner);
        this.AlphaGovernor = new ethers.ContractFactory(govabi, govbytecode, owner);
    });

    beforeEach(async function () {
        console.log(`Main signer: ${owner.address}`);
        this.nft = await this.NFT.deploy();
        this.timelock = await this.TIMELOCK.deploy();
        this.governor = await this.AlphaGovernor.deploy(this.nft.address, this.timelock.address);

    });

    // Test cases

    //////////////////////////////
    //       Constructor 
    //////////////////////////////
    describe("Deployment", function () {
        it('Deploys the NFT Contract', async function () {
            await this.nft.deployed();
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
    });

    //////////////////////////////
    //  setRemainderDestination 
    //////////////////////////////
    /*
    describe("otherMethod", function () {

    });
    */
});