//SPDX-License-Identifier: MIT
// contracts/ERC721.sol

pragma solidity ^0.8.0;

/**
 * @dev Interface for the Alpha Mecha DAO NFT
 */
interface INFT {
    /**
     * @dev Mints 1 token to input address
     * Returns the tokenId
     * Emits a Mint event
     */
    function mintAMD(address) external returns(uint16);

    event MintedAMD(address indexed to, uint16 tokenId);
}