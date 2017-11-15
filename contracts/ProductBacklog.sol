pragma solidity ^0.4.0;


import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';
import './PlanningPoker.sol';


contract ProductBacklog is TrustedOracle {

  using SafeMath for uint;
  mapping (string => Voting) votings;

  Project project;

  struct Voting {
  string issue;
  uint sum;
  uint256 totalSupply;
  bool isValid;
  bool isOpen;
  mapping (address => uint256) votes;
  }

  modifier onlyTokenHolders {
    require(project.balanceOf(msg.sender) > 0);
    _;
  }

  function ProductBacklog(address _projectContract){
    project = Project(_projectContract);
  }

  function addVoting(string issue) external onlyTokenHolders {
    votings[issue] = Voting(issue, 0, 0, true, true);
  }

  function closeVoting(string issue) external onlyTrustedOracle {
    require(votings[issue].isValid);
    votings[issue].isOpen = false;
  }

  function vote(string issue) external onlyTokenHolders {
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

  function getVote(string issue) public constant returns (uint256, uint256) {
    return (votings[issue].votes[msg.sender], votings[issue].totalSupply);
  }

  function getVoting(string issue) public constant returns (string, uint, uint, bool) {
    return (votings[issue].issue, votings[issue].totalSupply, votings[issue].sum, votings[issue].isOpen);
  }
}
