pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';
import './StoryPointsVoting.sol';
import './Crowdsale.sol';


contract Project is StandardToken, Ownable, TrustedOracle {
  using SafeMath for uint16;

  string public name;

  string public symbol;

  uint8 public decimals;

  uint storyPointMultiplier = 1000000000000000000;

  StoryPointsVoting storyPointsVoting;

  Crowdsale public crowdsale;

  address trustedCrowdsale;

  Worker[] public workers;

  address[] public holders;

  struct Worker {
  address _address;
  string username;
  }

  mapping (string => address) usernames;

  modifier onlyTrustedCrowdsale {
    require(msg.sender == trustedCrowdsale);
    _;
  }

  function Project(string _name, string _symbol, uint8 _decimals) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  /**
  * @dev overwrite BasicToken transfer function
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));

    if (balanceOf(_to) == 0) {
      holders.push(_to);
    }
    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function initStoryPointsVoting(address _storyPointsVoting) onlyOwner {
    storyPointsVoting = StoryPointsVoting(_storyPointsVoting);
  }

  function initCrowdsale(address _crowdsale) onlyOwner {
    trustedCrowdsale = _crowdsale;
    crowdsale = Crowdsale(_crowdsale);
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

  function getHoldersLength() public constant returns (uint){
    return holders.length;
  }

  function payAward(string username, string issue) public onlyTrustedOracle {
    address recepient = usernames[username];
    var (id, count, sum, isOpen, awardPaid) = storyPointsVoting.getVoting(issue);
    require(!isOpen);
    if (recepient != 0 && count > 0 && sum > 0 && !awardPaid) {
      storyPointsVoting.markVotingAsPaid(issue);
      uint256 awardSupply = sum.mul(storyPointMultiplier).div(count);
      balances[recepient] = balances[recepient].add(awardSupply);
      totalSupply = totalSupply.add(awardSupply);
    }
  }

  function transferToCrowdsale(address _from, uint _value) onlyTrustedCrowdsale {
    require(balanceOf(_from) >= _value);
    balances[_from] = balances[_from].sub(_value);
    balances[trustedCrowdsale] = balances[trustedCrowdsale].add(_value);
    Transfer(_from, trustedCrowdsale, _value);
  }
}
