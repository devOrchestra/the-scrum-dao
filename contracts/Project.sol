pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract Project is StandardToken, Ownable {
  string public name;
  string public symbol;
  uint8 public decimals;

  uint storyPointMultiplier = 10;

  address[] public workers;

  mapping (string => address) workersLogins;

  address trustedOracle;

  modifier onlyTeem {
    bool result = false;
    for (uint i = 0; i < workers.length; i++) {
      if (msg.sender == workers[i]) {
        result = true;
        break;
      }
    }
    require(result);
    _;
  }

  modifier onlyTrustedOracle {
    require(msg.sender == trustedOracle);
    _;
  }

  function Project(string tokenName,string tokenSymbol, uint8 tokenDecimals, address oracle){
    name=tokenName;
    symbol=tokenSymbol;
    decimals = tokenDecimals;
    trustedOracle = oracle;
  }

  function addWorker(address worker, string login) onlyOwner {
    bool alreadyAdded = false;
    if (workersLogins[login] != 0) {
      alreadyAdded = true;
    }
    require(!alreadyAdded);
    workers.push(worker);
    workersLogins[login] = worker;
  }

  function getWorkersLength() public constant returns (uint){
    return workers.length;
  }

  function getWorker(uint i) public constant returns (address){
    return workers[i];
  }

  function payAward(string login, uint256 points) public onlyTrustedOracle {
    address recepient = workersLogins[login];
    if (recepient != 0 && points > 0) {
      uint256 awardSupply = points.mul(storyPointMultiplier);
      balances[recepient] = balances[recepient].add(awardSupply);
      totalSupply = totalSupply.add(awardSupply);
    }
  }
}
