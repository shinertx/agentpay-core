// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {AgentPaySettlement} from "../src/AgentPaySettlement.sol";

contract DeployAgentPay is Script {
    // Base Mainnet Native USDC Address
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        AgentPaySettlement settlement = new AgentPaySettlement(BASE_USDC);
        
        vm.stopBroadcast();

        console2.log("AgentPaySettlement deployed to:", address(settlement));
        console2.log("Pinned to USDC at:", BASE_USDC);
    }
}
