//SPDX-License-Identifier: MIT
// contracts/ERC721.sol

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";
import "./INFT.sol";

contract NFT is ERC721, Ownable, ERC721Votes, INFT {
    using Counters for Counters.Counter;

    bool private isMintLive = false;
    Counters.Counter private _tokenIds;

    uint256 public constant MECHA_PRICE = 3000000000000000000; // 3 AVAX
    uint256 public mintTime;

    mapping(address => bool) private whitelisted;
    uint16 public constant supply = 1000;

    constructor()
        EIP712("Alpha Mecha DAO", "1.0.0")
        ERC721("AlphaMechaDAO", "AMD")
    {
        Counters.reset(_tokenIds);
    }

    function startMint() external onlyOwner {
        isMintLive = true;
        mintTime = block.timestamp + 1 days;
    }

    function whitelist(address _user) external onlyOwner {
        whitelisted[_user] = true;
    }

    function batchWhitelist(address[] memory _users) external onlyOwner {
        uint256 size = _users.length;
        for (uint256 i = 0; i < size; i++) {
            address user = _users[i];
            whitelisted[user] = true;
        }
    }

    function isMintActive() public view returns (bool mintStatus) {
        return isMintLive;
    }

    function isWhiteListed(address user)
        public
        view
        returns (bool isWhitelisted)
    {
        return whitelisted[user];
    }

    // commented out unused variable
    // function awardItem(address player, string memory tokenURI)
    function mintAMD() external payable override returns (uint16 tokenID) {
        require(msg.sender != address(0), "Cannot mint to the zero address");
        require(msg.value >= MECHA_PRICE, "AVAX value sent is incorrect");
        require(isMintLive, "Mint is not active");
        require(whitelisted[msg.sender], "You are not whitelisted");
        require(mintTime > block.timestamp, "mint is no longer active");

        _tokenIds.increment();

        uint16 newItemId = uint16(_tokenIds.current());
        _mint(msg.sender, newItemId);
        emit MintedAMD(msg.sender, newItemId);
        delegate(msg.sender);
        // _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Votes, ERC721) {
        
    }
}
