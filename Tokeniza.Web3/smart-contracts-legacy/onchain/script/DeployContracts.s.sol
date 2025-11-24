
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AssetToken.sol";
import "../src/Marketplace.sol";
import "../src/Waitlist.sol";

contract DeployContracts is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy AssetToken
        AssetToken assetToken = new AssetToken();
        console.log("AssetToken deployed at:", address(assetToken));

        // Deploy Marketplace
        Marketplace marketplace = new Marketplace();
        console.log("Marketplace deployed at:", address(marketplace));

        // Deploy Waitlist
        Waitlist waitlist = new Waitlist();
        console.log("Waitlist deployed at:", address(waitlist));

        vm.stopBroadcast();
    }
}
