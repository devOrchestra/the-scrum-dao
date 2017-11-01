pragma solidity ^0.4.0;


import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';
import './StoryPointsVoting.sol';


contract ProductBacklog is TrustedOracle{

  using SafeMath for uint;
  mapping (string => Voting) votings;

  Project project;

  struct Voting {
  string issue;
  uint sum;
  uint totalSupply;
  bool isValid;
  bool isOpen;
  mapping (address => uint) votes;
  }

  modifier onlyTokenHolders {
    bool result = false;
    require(project.balanceOf(msg.sender) > 0);
    _;
  }

  function ProductBacklog(address _projectContract){
    project = Project(_projectContract);
  }

  function addVoting(string issue) onlyTrustedOracle {
    votings[issue] = Voting(issue, 0, 0, true, true);
  }

  function closeVoting(string issue) onlyTrustedOracle {
    require(votings[issue].isValid);
    votings[issue].isOpen = false;
  }

  function vote(string issue) onlyTokenHolders {
    if (!votings[issue].isValid) {
      votings[issue] = Voting(issue, 0, 0, true, true);
    }
    require(votings[issue].isOpen);
    if (votings[issue].votes[msg.sender] == 0) {
      votings[issue].sum = votings[issue].sum.add(project.balanceOf(msg.sender));
      votings[issue].votes[msg.sender] = project.balanceOf(msg.sender);
      votings[issue].totalSupply = project.totalSupply();
    }
  }

  function getVoting(string issue) public constant returns (string, uint, uint, bool) {
    return (votings[issue].issue, votings[issue].totalSupply, votings[issue].sum, votings[issue].isOpen);
  }
}
