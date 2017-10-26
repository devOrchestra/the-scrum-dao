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

  StoryPointsVoting storyPointsVoting;

  Worker[] public workers;

  struct Worker {
  address _address;
  string username;
  }

  mapping (string => address) usernames;

  function Project(string _name, string _symbol, uint8 _decimals) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  function initStoryPointsVoting(address _storyPointsVoting) onlyOwner {
    storyPointsVoting = StoryPointsVoting(_storyPointsVoting);
  }

  function addWorker(address worker, string username) onlyOwner {
    bool alreadyAdded = false;
    if (usernames[username] != 0) {
      alreadyAdded = true;
    }
    require(!alreadyAdded);
    workers.push(Worker(worker, username));
    usernames[username] = worker;
  }

  function getWorkersLength() public constant returns (uint){
    return workers.length;
  }

  function getWorker(uint i) public constant returns (address, string){
    return (workers[i]._address, workers[i].username);
  }

  function payAward(string username, string issue) public onlyTrustedOracle {
    address recepient = usernames[username];
    var (id, count, sum, isOpen, awardPaid) = storyPointsVoting.getVoting(issue);
    require(!isOpen);
    if (recepient != 0 && count > 0 && sum > 0 && !awardPaid) {
      uint256 awardSupply = sum.mul(storyPointMultiplier).div(count);
      balances[recepient] = balances[recepient].add(awardSupply);
      totalSupply = totalSupply.add(awardSupply);
      storyPointsVoting.markVotingAsPaid(issue);
    }
  }
}
