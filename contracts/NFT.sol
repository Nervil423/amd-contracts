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

    uint256 public constant MECHA_PRICE = 3000000000000000000; // 3 AVAX 
    


    constructor() 
        EIP712("Alpha Mecha DAO", "1.0.0")
        ERC721("AlphaMechaDAO", "AMD") {
            Counters.reset(_tokenIds);
    }

    // commented out unused variable
    // function awardItem(address player, string memory tokenURI)
    function mintAMD() external payable override returns(uint16 tokenID) {
        require(msg.value >= MECHA_PRICE, "Avalanche value sent is incorrect");

        _tokenIds.increment();

        uint16 newItemId = uint16(_tokenIds.current());
        _mint(msg.sender, newItemId);
        emit MintedAMD(msg.sender, newItemId);

        _afterTokenTransfer(address(0), msg.sender, newItemId);
        delegate(msg.sender);
        // _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    

    function _afterTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721Votes, ERC721) {
        
    }
    
}
