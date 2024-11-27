// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HTS/HederaTokenService.sol";

contract MultiPartyStateChannel is ReentrancyGuard, HederaTokenService {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct Channel {
        address[] participants;
        address closer;
        mapping(address => bool) isParticipant;
        mapping(address => uint256) hbarDeposits;
        mapping(address => mapping(address => uint256)) tokenDeposits;
        mapping(address => mapping(address => int64[])) nftDeposits;
        uint256 totalParticipants;
        bool isOpen;
    }

    mapping(bytes32 => Channel) public channels;

    event ChannelOpened(
        bytes32 indexed channelId,
        address[] participants,
        address closer,
        uint256[] hbarAmounts,
        address[] tokens,
        uint256[][] tokenAmounts,
        address[] nftTokens,
        int64[][][] serialNumbers
    );

    event ChannelClosed(
        bytes32 indexed channelId,
        address[] participants,
        uint256[] hbarBalances,
        address[] tokens,
        uint256[][] tokenBalances,
        address[] nftTokens,
        int64[][][] nftFinalBalances
    );

    function openChannel(
        address[] calldata participants,
        address closer,
        address[] calldata tokens,
        uint256[] calldata tokenAmounts,
        address[] calldata nftTokens,
        int64[][] calldata serialNumbers
    ) external payable nonReentrant {
        require(participants.length >= 2, "Minimum 2 participants");
        require(closer != address(0), "Invalid closer");
        
        bytes32 channelId = keccak256(
            abi.encodePacked(
                msg.sender,
                participants,
                block.timestamp
            )
        );

        Channel storage channel = channels[channelId];
        require(!channel.isOpen, "Channel exists");

        channel.closer = closer;
        channel.totalParticipants = participants.length;
        channel.isOpen = true;

        // Register participants
        for (uint i = 0; i < participants.length;) {
            require(participants[i] != address(0), "Invalid participant");
            require(!channel.isParticipant[participants[i]], "Duplicate participant");
            
            channel.participants.push(participants[i]);
            channel.isParticipant[participants[i]] = true;
            
            if (participants[i] == msg.sender) {
                channel.hbarDeposits[msg.sender] = msg.value;
            }
            unchecked { ++i; }
        }

        // Handle fungible token deposits
        if (tokens.length > 0) {
            for (uint i = 0; i < tokens.length;) {
                int response = HederaTokenService.transferToken(
                    tokens[i],
                    msg.sender,
                    address(this),
                    int64(uint64(tokenAmounts[i]))
                );
                require(response == HederaResponseCodes.SUCCESS, "Token transfer failed");
                channel.tokenDeposits[tokens[i]][msg.sender] = tokenAmounts[i];
                unchecked { ++i; }
            }
        }

        // Handle NFT deposits
        if (nftTokens.length > 0) {
            for (uint i = 0; i < nftTokens.length; i++) {
                uint serialNumbersLength = serialNumbers[i].length; // Store the length outside the loop

                // Allocate memory for senders and receivers arrays
                address[] memory nftSenders = new address[](serialNumbersLength);
                address[] memory nftReceivers = new address[](serialNumbersLength);

                // Populate the senders and receivers arrays
                for (uint j = 0; j < serialNumbersLength; j++) {
                    nftSenders[j] = msg.sender;
                    nftReceivers[j] = address(this);
                    channel.nftDeposits[nftTokens[i]][msg.sender].push(serialNumbers[i][j]);
                }

                // Call the HederaTokenService transfer function
                int response = HederaTokenService.transferNFTs(
                    nftTokens[i],
                    nftSenders,
                    nftReceivers,
                    serialNumbers[i]
                );

                // Check if the transfer was successful
                require(response == HederaResponseCodes.SUCCESS, "NFT transfer failed");
            }
        }

        emit ChannelOpened(
            channelId,
            participants,
            closer,
            new uint256[](participants.length),
            tokens,
            new uint256[][](tokens.length),
            nftTokens,
            new int64[][][](nftTokens.length)
        );
    }

    function deposit(
        bytes32 channelId,
        address[] calldata tokens,
        uint256[] calldata tokenAmounts,
        address[] calldata nftTokens,
        int64[][] calldata serialNumbers
    ) external payable nonReentrant {
        Channel storage channel = channels[channelId];
        require(channel.isOpen, "Channel not open");
        require(channel.isParticipant[msg.sender], "Not a participant");

        channel.hbarDeposits[msg.sender] += msg.value;

        // Handle fungible token deposits
        if (tokens.length > 0) {
            for (uint i = 0; i < tokens.length;) {
                int response = HederaTokenService.transferToken(
                    tokens[i],
                    msg.sender,
                    address(this),
                    int64(uint64(tokenAmounts[i]))
                );
                require(response == HederaResponseCodes.SUCCESS, "Token transfer failed");
                channel.tokenDeposits[tokens[i]][msg.sender] += tokenAmounts[i];
                unchecked { ++i; }
            }
        }

        // Handle NFT deposits
        if (nftTokens.length > 0) {
            for (uint i = 0; i < nftTokens.length;) {
                address[] memory nftSenders = new address[](serialNumbers[i].length);
                address[] memory nftReceivers = new address[](serialNumbers[i].length);
                
                for (uint j = 0; j < serialNumbers[i].length;) {
                    nftSenders[j] = msg.sender;
                    nftReceivers[j] = address(this);
                    channel.nftDeposits[nftTokens[i]][msg.sender].push(serialNumbers[i][j]);
                    unchecked { ++j; }
                }

                int response = HederaTokenService.transferNFTs(
                    nftTokens[i],
                    nftSenders,
                    nftReceivers,
                    serialNumbers[i]
                );
                require(response == HederaResponseCodes.SUCCESS, "NFT transfer failed");
                unchecked { ++i; }
            }
        }
    }

    function closeChannel(
        bytes32 channelId,
        address[] calldata participants,
        uint256[] calldata hbarBalances,
        address[] calldata tokens,
        uint256[][] calldata tokenBalances,
        address[] calldata nftTokens,
        int64[][][] calldata nftFinalBalances,
        uint256 nonce,
        bytes calldata closerSignature
    ) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(channel.isOpen, "Channel not open");
        require(msg.sender == channel.closer, "Not closer");

        bytes32 messageHash = keccak256(
            abi.encode(
                channelId,
                nonce,
                participants,
                hbarBalances,
                tokens,
                tokenBalances,
                nftTokens,
                nftFinalBalances
            )
        );

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(closerSignature);
        require(signer == channel.closer, "Invalid signature");

        // Transfer HBAR
        for (uint i = 0; i < participants.length;) {
            if (hbarBalances[i] > 0) {
                payable(participants[i]).transfer(hbarBalances[i]);
            }
            unchecked { ++i; }
        }

        // Transfer fungible tokens
        // Transfer fungible tokens
        for (uint i = 0; i < tokens.length;) {
            for (uint j = 0; j < participants.length;) {
                if (tokenBalances[i][j] > 0) {
                    int response = HederaTokenService.transferToken(
                        tokens[i],
                        address(this),
                        participants[j],
                        int64(uint64(tokenBalances[i][j]))
                    );
                    require(response == HederaResponseCodes.SUCCESS, "Token transfer failed");
                }
                unchecked { ++j; }
            }
            unchecked { ++i; }
        }

        // Transfer NFTs
        for (uint i = 0; i < nftTokens.length;) {
            for (uint j = 0; j < participants.length;) {
                if (nftFinalBalances[i][j].length > 0) {
                    address[] memory nftSenders = new address[](nftFinalBalances[i][j].length);
                    address[] memory nftReceivers = new address[](nftFinalBalances[i][j].length);
                    
                    for (uint k = 0; k < nftFinalBalances[i][j].length;) {
                        nftSenders[k] = address(this);
                        nftReceivers[k] = participants[j];
                        unchecked { ++k; }
                    }

                    int response = HederaTokenService.transferNFTs(
                        nftTokens[i],
                        nftSenders,
                        nftReceivers,
                        nftFinalBalances[i][j]
                    );
                    require(response == HederaResponseCodes.SUCCESS, "NFT transfer failed");
                }
                unchecked { ++j; }
            }
            unchecked { ++i; }
        }

        channel.isOpen = false;
        emit ChannelClosed(
            channelId,
            participants,
            hbarBalances,
            tokens,
            tokenBalances,
            nftTokens,
            nftFinalBalances
        );
    }
}