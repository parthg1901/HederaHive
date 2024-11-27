// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.9 <0.9.0;

import "./IHRC719.sol";

interface IERCToken {
    function balanceOf(address account) external view returns (uint256);
}

interface IHRC is IHRC719, IERCToken {
    // NOTE: can be moved into IHRC once implemented https://hips.hedera.com/hip/hip-719
    function isAssociated(address evmAddress) external view returns (bool);
}
