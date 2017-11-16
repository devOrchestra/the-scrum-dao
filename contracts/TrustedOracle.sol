pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TrustedOracle is Ownable {
  address public trustedOracle;

  modifier onlyTrustedOracle {
    require(msg.sender == trustedOracle);
    _;
  }

  function TrustedOracle() public {}

  function addTrustedOracle(address _trustedOracle)  external onlyOwner {
    trustedOracle = _trustedOracle;
  }
}
