// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./HTS/HederaTokenService.sol";
import "./HTS/ExpiryHelper.sol";
import "./HTS/KeyHelper.sol";
import "./HTS/IHRC.sol";

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";


contract HederaHiveTokens is HederaTokenService, ExpiryHelper, KeyHelper {

    int64 initialTotalSupply = 10000000000;
    int64 maxSupply = 20000000000;
    int32 decimals = 0;
    bool freezeDefaultStatus = false;

    event ResponseCode(int responseCode);
    event CreatedToken(address tokenAddress);
    event MintedToken(int64 newTotalSupply, int64[] serialNumbers);
    event KycGranted(bool kycGranted);
    event PausedToken(bool paused);
    event UnpausedToken(bool unpaused);

    function createFungibleTokenWithSECP256K1AdminKeyPublic(
        string memory name, string memory symbol, string memory memo, address treasury, address adminKey
    ) public payable returns (address) {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](6);
        keys[0] = getSingleKey(KeyType.ADMIN, KeyType.PAUSE, KeyValueType.CONTRACT_ID, adminKey);
        keys[1] = getSingleKey(KeyType.KYC, KeyValueType.CONTRACT_ID, adminKey);
        keys[2] = getSingleKey(KeyType.FREEZE, KeyValueType.CONTRACT_ID, adminKey);
        keys[3] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, adminKey);
        keys[4] = getSingleKey(KeyType.WIPE, KeyValueType.CONTRACT_ID, adminKey);
        keys[5] = getSingleKey(KeyType.FEE, KeyValueType.CONTRACT_ID, adminKey);

        IHederaTokenService.Expiry memory expiry = IHederaTokenService.Expiry(
            0, treasury, 8000000
        );

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken(
            name, symbol, treasury, memo, true, maxSupply, freezeDefaultStatus, keys, expiry
        );

        (int responseCode, address tokenAddress) =
        HederaTokenService.createFungibleToken(token, initialTotalSupply, decimals);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }

        emit CreatedToken(tokenAddress);

        return tokenAddress;
    }

    function createFungibleTokenWithSECP256K1AdminKeyAssociateAndTransferToAddressPublic(string memory name, string memory symbol, string memory memo,address treasury, address adminKey, int64 amount) public payable {
        address tokenAddress = this.createFungibleTokenWithSECP256K1AdminKeyPublic{value : msg.value}(name, symbol, memo, treasury, adminKey);
        this.associateTokenPublic(msg.sender, tokenAddress);
        this.grantTokenKycPublic(tokenAddress, msg.sender);
        HederaTokenService.transferToken(tokenAddress, address(this), msg.sender, amount);
    }
    function createNonFungibleTokenWithSECP256K1AdminKeyPublic(
        string memory name, string memory symbol, string memory memo, address treasury, address adminKey
    ) public payable returns (address) {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](6);
        keys[0] = getSingleKey(KeyType.ADMIN, KeyType.PAUSE, KeyValueType.CONTRACT_ID, adminKey);
        keys[1] = getSingleKey(KeyType.KYC, KeyValueType.CONTRACT_ID, adminKey);
        keys[2] = getSingleKey(KeyType.FREEZE, KeyValueType.CONTRACT_ID, adminKey);
        keys[3] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, adminKey);
        keys[4] = getSingleKey(KeyType.WIPE, KeyValueType.CONTRACT_ID, adminKey);
        keys[5] = getSingleKey(KeyType.FEE, KeyValueType.CONTRACT_ID, adminKey);

        IHederaTokenService.Expiry memory expiry = IHederaTokenService.Expiry(
            0, treasury, 8000000
        );

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken(
            name, symbol, treasury, memo, true, maxSupply, freezeDefaultStatus, keys, expiry
        );

        (int responseCode, address tokenAddress) =
        HederaTokenService.createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }

        emit CreatedToken(tokenAddress);
        return tokenAddress;
    }

    function mintTokenPublic(address token, int64 amount, bytes[] memory metadata) public
    returns (int responseCode, int64 newTotalSupply, int64[] memory serialNumbers)  {
        (responseCode, newTotalSupply, serialNumbers) = HederaTokenService.mintToken(token, amount, metadata);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }

        emit MintedToken(newTotalSupply, serialNumbers);
    }

    function mintTokenToAddressPublic(address token, int64 amount, address to, bytes[] memory metadata) public
    returns (int responseCode, int64 newTotalSupply, int64[] memory serialNumbers)  {
        (responseCode, newTotalSupply, serialNumbers) = HederaTokenService.mintToken(token, amount, metadata);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }

        emit MintedToken(newTotalSupply, serialNumbers);
        if (serialNumbers.length > 0) {
            HederaTokenService.transferNFT(token, address(this), to, serialNumbers[0]);
        } else {
            HederaTokenService.transferToken(token, address(this), to, amount);
        }

    }

    function associateTokensPublic(address account, address[] memory tokens) external returns (int256 responseCode) {
        (responseCode) = HederaTokenService.associateTokens(account, tokens);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function associateTokenPublic(address account, address token) public returns (int responseCode) {
        responseCode = HederaTokenService.associateToken(account, token);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function grantTokenKycPublic(address token, address account) external returns (int64 responseCode) {
        (responseCode) = HederaTokenService.grantTokenKyc(token, account);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function deleteTokenPublic(address token) public returns (int responseCode) {
        responseCode = HederaTokenService.deleteToken(token);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function freezeTokenPublic(address token, address account) public returns (int responseCode) {
        responseCode = HederaTokenService.freezeToken(token, account);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function unfreezeTokenPublic(address token, address account) public returns (int responseCode) {
        responseCode = HederaTokenService.unfreezeToken(token, account);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function revokeTokenKycPublic(address token, address account) external returns (int64 responseCode) {
        (responseCode) = HederaTokenService.revokeTokenKyc(token, account);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function pauseTokenPublic(address token) public returns (int responseCode) {
        responseCode = HederaTokenService.pauseToken(token);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }

        emit PausedToken(true);
    }

    function unpauseTokenPublic(address token) public returns (int responseCode) {
        responseCode = HederaTokenService.unpauseToken(token);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }

        emit UnpausedToken(true);
    }

    function wipeTokenAccountPublic(address token, address account, int64 amount) public returns (int responseCode) {
        responseCode = HederaTokenService.wipeTokenAccount(token, account, amount);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function wipeTokenAccountNFTPublic(address token, address account, int64[] memory serialNumbers) public returns (int responseCode) {
        responseCode = HederaTokenService.wipeTokenAccountNFT(token, account, serialNumbers);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function updateTokenInfoPublic(address token, IHederaTokenService.HederaToken memory tokenInfo)external returns (int responseCode) {
        (responseCode) = HederaTokenService.updateTokenInfo(token, tokenInfo);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function updateTokenExpiryInfoPublic(address token, IHederaTokenService.Expiry memory expiryInfo)external returns (int responseCode) {
        (responseCode) = HederaTokenService.updateTokenExpiryInfo(token, expiryInfo);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function updateTokenKeysPublic(address token, IHederaTokenService.TokenKey[] memory keys) public returns (int64 responseCode) {
        (responseCode) = HederaTokenService.updateTokenKeys(token, keys);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function burnTokenPublic(address token, int64 amount, int64[] memory serialNumbers) external returns (int256 responseCode, int64 newTotalSupply) {
        (responseCode, newTotalSupply) = HederaTokenService.burnToken(token, amount, serialNumbers);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function dissociateTokensPublic(address account, address[] memory tokens) external returns (int256 responseCode) {
        (responseCode) = HederaTokenService.dissociateTokens(account, tokens);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function dissociateTokenPublic(address account, address token) public returns (int responseCode) {
        responseCode = HederaTokenService.dissociateToken(account, token);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function approvePublic(address token, address spender, uint256 amount) public returns (int responseCode) {
        responseCode = HederaTokenService.approve(token, spender, amount);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function approveNFTPublic(address token, address approved, uint256 serialNumber) public returns (int responseCode) {
        responseCode = HederaTokenService.approveNFT(token, approved, serialNumber);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }
    }

    function setApprovalForAllPublic(address token, address operator, bool approved) public returns (int responseCode) {
        responseCode = HederaTokenService.setApprovalForAll(token, operator, approved);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }
    }

    function updateFungibleTokenCustomFeesPublic(
        address token, 
        IHederaTokenService.FixedFee[] memory fixedFees,
        IHederaTokenService.FractionalFee[] memory fractionalFees
    ) public returns (int responseCode) {
        responseCode = HederaTokenService.updateFungibleTokenCustomFees(token, fixedFees, fractionalFees);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert(Strings.toString(uint(responseCode)));
        }
    }

    function updateNonFungibleTokenCustomFeesPublic(
        address token, 
        IHederaTokenService.FixedFee[] memory fixedFees,
        IHederaTokenService.RoyaltyFee[] memory royaltyFees
    ) public returns (int responseCode) {
        responseCode = HederaTokenService.updateNonFungibleTokenCustomFees(token, fixedFees, royaltyFees);
        emit ResponseCode(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert(Strings.toString(uint(responseCode)));
        }
    }

    function balanceOf(
        address token
    ) public view returns (uint256 balance) {
        return IHRC(token).balanceOf(msg.sender);
    }

    function ownerOf(
        address token,
        uint256 serialNumber
    ) public view returns (address owner) {
        return IERC721(token).ownerOf(serialNumber);
    }
}