pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Project.sol';
import './TrustedOracle.sol';


contract StoryPointsVoting is Ownable, TrustedOracle {
  using SafeMath for uint;
  mapping (string => Voting) votings;

  Project project;

  struct Voting {
  string issue;
  uint votesCount;
  uint sum;
  bool isValid;
  bool isOpen;
  bool awardPaid;
  mapping (address => uint) votes;
  }

  struct Vote {
  address voter;
  uint points;
  }

  modifier onlyTeem {
    bool result = false;
    uint length = project.getWorkersLength();
    for (uint i = 0; i < length; i++) {
      if (msg.sender == project.getWorker(i)) {
        result = true;
        break;
      }
    }
    require(result);
    _;
  }

  function StoryPointsVoting(address _projectContract){
    project = Project(_projectContract);
  }

  function addVoting(string issue) onlyTrustedOracle {
    votings[issue] = Voting(issue, 0, 0, true, true, false);
  }

  function closeVoting(string issue) onlyTrustedOracle {
    require(votings[issue].isValid);
    votings[issue].isOpen = false;
  }

  function vote(string issue, uint points) onlyTeem {
    if (!votings[issue].isValid) {
      addVoting(issue);
    }
    if (votings[issue].votes[msg.sender] > 0) {
      votings[issue].sum = votings[issue].sum.sub(votings[issue].votes[msg.sender]).add(points);
    }
    else {
      votings[issue].sum = votings[issue].sum.add(points);
    }
    votings[issue].votes[msg.sender] = points;
    votings[issue].votesCount++;
  }

  function getVoting(string issue) public constant returns (uint, uint, bool, bool){
    return (votings[issue].votesCount, votings[issue].sum, votings[issue].isOpen, votings[issue].awardPaid);
  }

  function markVotingAsPaid(string issue){
    if (votings[issue].isValid) {
      votings[issue].awardPaid = true;
    }
  }
}
