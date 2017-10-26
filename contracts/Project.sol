pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';
import './StoryPointsVoting.sol';


contract Project is StandardToken, Ownable, TrustedOracle {
  using SafeMath for uint16;

  string public name;

  string public symbol;

  uint8 public decimals;

  uint storyPointMultiplier = 10;

  StoryPointsVoting storyPointsVoiting;

  address[] public workers;

  mapping (string => address) workersLogins;

  function Project(string _name, string _symbol, uint8 _decimals) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  function initStoryPointsVoiting(address _storyPointsVoiting) onlyOwner {
    storyPointsVoiting = StoryPointsVoting(_storyPointsVoiting);
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

  function payAward(string login, string issue) public onlyTrustedOracle {
    address recepient = workersLogins[login];
    var (count, sum, isOpen) = storyPointsVoiting.getVoiting(issue);
    require(!isOpen);
    if (recepient != 0 && count>0 && sum>0) {
      uint256 awardSupply = sum.mul(storyPointMultiplier).div(count);
      balances[recepient] = balances[recepient].add(awardSupply);
      totalSupply = totalSupply.add(awardSupply);
    }
  }
}
