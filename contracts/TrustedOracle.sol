pragma solidity ^0.4.11;


contract TrustedOracle {
  address trustedOracle;

  modifier onlyTrustedOracle {
    require(msg.sender == trustedOracle);
    _;
  }

  function TrustedOracle(address _trustedOracle){
    trustedOracle = _trustedOracle;
  }
}
