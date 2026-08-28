// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

/**
 * @title AgentPaySettlement
 * @dev Escrow and settlement layer for AI M2M micro-payments.
 */
contract AgentPaySettlement {
    using ECDSA for bytes32;

    IERC20 public immutable usdc;

    // Agent address => Available Balance in Escrow
    mapping(address => uint256) public agentBalances;

    // Agent address => Provider Address => Nonce (to prevent replay attacks)
    mapping(address => mapping(address => uint256)) public nonces;

    event Deposited(address indexed agent, uint256 amount);
    event Claimed(address indexed provider, address indexed agent, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /**
     * @dev Agents deposit USDC into their AgentPay allowance.
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        agentBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev API Providers submit a cryptographically signed receipt to claim funds.
     */
    function claim(address agent, uint256 amount, bytes calldata signature) external {
        require(amount > 0, "Amount must be greater than 0");
        require(agentBalances[agent] >= amount, "Insufficient agent balance");

        // Construct the message hash: Hash(Provider, Amount, Nonce)
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, amount, nonces[agent][msg.sender]));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Verify the agent actually signed this specific payment receipt
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == agent, "Invalid signature");

        // Update state
        nonces[agent][msg.sender]++;
        agentBalances[agent] -= amount;

        // Transfer funds to provider
        require(usdc.transfer(msg.sender, amount), "Transfer failed");

        emit Claimed(msg.sender, agent, amount);
    }
}
