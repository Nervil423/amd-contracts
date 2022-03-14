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
    
    bool isMintLive = false;
    Counters.Counter private _tokenIds;
    uint8 constant MAX_MINT_TX = 1;
    


    constructor() 
        EIP712("Alpha Mecha DAO", "1.0.0")
        ERC721("AlphaMechaDAO", "AMD") {
    }

    // commented out unused variable
    // function awardItem(address player, string memory tokenURI)
    function mintAMD(address player) external override {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        // _setTokenURI(newItemId, tokenURI);

    }

    function _afterTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721Votes, ERC721) {

    }
    
}
