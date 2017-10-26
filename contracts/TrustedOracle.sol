pragma solidity ^0.4.11;


contract TrustedOracle {
  address public trustedOracle;

  modifier onlyTrustedOracle {
    require(msg.sender == trustedOracle);
    _;
  }

  function TrustedOracle(){}

  function addTrustedOracle(address _trustedOracle){
    trustedOracle = _trustedOracle;
  }
}
