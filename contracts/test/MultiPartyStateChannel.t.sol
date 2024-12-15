// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MultiPartyStateChannel.sol";
import "../src/HederaHiveTokens.sol";
import './utils/HederaTokenUtils.sol';
import './utils/HederaFungibleTokenUtils.sol';
import './mocks/interfaces/IHRCCommon.sol';

contract MultiPartyStateChannelTest is Test, HederaHiveTokens, HederaTokenUtils {
    MultiPartyStateChannel public channel;
    address public token1;
    address public token2;
    address public token3;
    address public nft1;
    address public nft2;

    address public charlie = makeAddr("charlie");
    uint256 closerPrivateKey = 0xabc123;

    address closer = vm.addr(closerPrivateKey);

    uint256 public constant INITIAL_BALANCE = 100 ether;
    int64 public constant TOKEN_AMOUNT = 1000;
    
    function setUp() public {
        _setUpHtsPrecompileMock();
        _setUpAccounts();

        // Deploy contracts
        channel = new MultiPartyStateChannel();
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = KeyHelper.getSingleKey(KeyHelper.KeyType.SUPPLY, KeyHelper.KeyValueType.CONTRACT_ID, alice);
        token1 = createFungibleTokenWithSECP256K1AdminKeyPublic("token1", "TK1", "", address(this), address(this));
        token2 = createFungibleTokenWithSECP256K1AdminKeyPublic("token2", "TK2", "", address(this), address(this));

        nft1 = createNonFungibleTokenWithSECP256K1AdminKeyPublic("NFT1", "NFT1", "", address(this), address(this));
        nft2 = createNonFungibleTokenWithSECP256K1AdminKeyPublic("NFT2", "NFT2", "", address(this), address(this));

        associateTokenPublic(address(channel), token1);
        associateTokenPublic(address(channel), token2);

        associateTokenPublic(alice, token1);
        associateTokenPublic(alice, token2);
        associateTokenPublic(bob, token1);
        associateTokenPublic(bob, token2);

        associateTokenPublic(address(channel), nft1);
        associateTokenPublic(address(channel), nft2);

        associateTokenPublic(alice, nft1);
        associateTokenPublic(alice, nft2);
        associateTokenPublic(bob, nft1);
        associateTokenPublic(bob, nft2);

        // Setup initial balances
        vm.deal(charlie, INITIAL_BALANCE);

        // Mint tokens
        mintTokenToAddressPublic(token1, TOKEN_AMOUNT, alice, new bytes[](0));
        mintTokenToAddressPublic(token2, TOKEN_AMOUNT, alice, new bytes[](0));

        mintTokenToAddressPublic(token1, TOKEN_AMOUNT, bob, new bytes[](0));
        mintTokenToAddressPublic(token2, TOKEN_AMOUNT, bob, new bytes[](0));

        // Mint NFTs
        mintTokenToAddressPublic(nft1, 2, alice, new bytes[](0));
        mintTokenToAddressPublic(nft2, 1, alice, new bytes[](0));
        mintTokenToAddressPublic(nft2, 1, bob, new bytes[](0));

        // Approve channel contract
        vm.startPrank(alice);
        approve(token1, address(channel), type(uint256).max);
        approve(token2, address(channel), type(uint256).max);
        setApprovalForAllPublic(nft1, address(channel), true);
        setApprovalForAllPublic(nft2, address(channel), true);

        vm.stopPrank();

        vm.startPrank(bob);
        approve(token1, address(channel), type(uint256).max);
        approve(token2, address(channel), type(uint256).max);
        setApprovalForAllPublic(nft1, address(channel), true);
        setApprovalForAllPublic(nft2, address(channel), true);
        vm.stopPrank();
    }

    function test_OpenChannelBasic() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );
    }

    function test_OpenChannelWithTokens() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(token1);
        erc20Tokens[1] = address(token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = 100;
        erc20Amounts[1] = 200;

        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        
        assertEq(IERCCommonToken(token1).balanceOf(address(channel)), 100);
        assertEq(IERCCommonToken(token2).balanceOf(address(channel)), 200);
    }

    function test_OpenChannelWithNFTs() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);

        address[] memory nftContracts = new address[](2);
        nftContracts[0] = address(nft1);
        nftContracts[1] = address(nft2);

        int64[][] memory nftIds = new int64[][](2);
        nftIds[0] = new int64[](1);
        nftIds[0][0] = 1;  // NFT1 ID 0
        nftIds[1] = new int64[](1);
        nftIds[1][0] = 1;  // NFT2 ID 0

        vm.prank(alice);
        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        assertEq(ERC721(nft1).ownerOf(1), address(channel));
        assertEq(ERC721(nft2).ownerOf(1), address(channel));
    }

    function test_Deposit() public {
        // First open a channel
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        bytes32 channelId = keccak256(
            abi.encodePacked(
                alice,
                participants,
                block.timestamp
            )
        );

        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        // Now make a deposit
        erc20Tokens = new address[](1);
        erc20Tokens[0] = address(token1);
        
        erc20Amounts = new uint256[](1);
        erc20Amounts[0] = 100;

        vm.prank(bob);
        channel.deposit{value: 0.5 ether}(
            channelId,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        assertEq(IERCCommonToken(token1).balanceOf(address(channel)), 100);
    }

    function test_CloseChannel() public {
        // Open channel with initial deposits
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(token1);

        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = 100;

        address[] memory nftContracts = new address[](1);
        nftContracts[0] = address(nft1);

        int64[][] memory nftIds = new int64[][](1);
        nftIds[0] = new int64[](1);
        nftIds[0][0] = 1;

        vm.prank(alice);
        bytes32 channelId = keccak256(
            abi.encodePacked(
                alice,
                participants,
                block.timestamp
            )
        );

        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        vm.warp(block.timestamp + 31 days);

        // Prepare closing state
        uint256[] memory hbarBalances = new uint256[](2);
        hbarBalances[0] = 0.7 ether;
        hbarBalances[1] = 0.3 ether;

        uint256[][] memory erc20Balances = new uint256[][](1);
        erc20Balances[0] = new uint256[](2);
        erc20Balances[0][0] = 60;  // Alice's final token balance
        erc20Balances[0][1] = 40;  // Bob's final token balance

        int64[][][] memory nftFinalBalances = new int64[][][](1);
        nftFinalBalances[0] = new int64[][](2);
        nftFinalBalances[0][0] = new int64[](0);  // Alice gets no NFTs
        nftFinalBalances[0][1] = new int64[](1);  // Bob gets NFT ID 0
        nftFinalBalances[0][1][0] = 1;

        // Close the channel
        vm.prank(closer);
        channel.finalizeChannel(
            channelId,
            participants,
            hbarBalances,
            erc20Tokens,
            erc20Balances,
            nftContracts,
            nftFinalBalances
        );

        // Verify final balances
        assertEq(alice.balance, INITIAL_BALANCE - 1 ether + 0.7 ether);
        assertEq(bob.balance, INITIAL_BALANCE + 0.3 ether);
        assertEq(int64(uint64(IERCCommonToken(token1).balanceOf(alice))), TOKEN_AMOUNT - 100 + 60);
        assertEq(int64(uint64(IERCCommonToken(token1).balanceOf(bob))), TOKEN_AMOUNT + 40);
        assertEq(ERC721(nft1).ownerOf(1), bob);
    }

    function testFail_OpenChannelWithOneParticipant() public {
        address[] memory participants = new address[](1);
        participants[0] = alice;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );
    }

    function testFail_NonParticipantDeposit() public {
        // First open a channel
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        bytes32 channelId = keccak256(
            abi.encodePacked(
                alice,
                participants,
                block.timestamp
            )
        );

        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        // Try to deposit as non-participant
        vm.prank(charlie);
        channel.deposit{value: 0.5 ether}(
            channelId,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );
    }

    function testFail_NonCloserClose() public {
        // First open a channel
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory nftContracts = new address[](0);
        int64[][] memory nftIds = new int64[][](0);

        vm.prank(alice);
        bytes32 channelId = keccak256(
            abi.encodePacked(
                alice,
                participants,
                block.timestamp
            )
        );

        channel.openChannel{value: 1 ether}(
            participants,
            closer,
            erc20Tokens,
            erc20Amounts,
            nftContracts,
            nftIds
        );

        // Try to close as non-closer
        uint256[] memory hbarBalances = new uint256[](2);
        uint256[][] memory erc20Balances = new uint256[][](0);
        int64[][][] memory nftFinalBalances = new int64[][][](0);
        
        vm.prank(alice);
        channel.finalizeChannel(
            channelId,
            participants,
            hbarBalances,
            erc20Tokens,
            erc20Balances,
            nftContracts,
            nftFinalBalances
        );
    }
}