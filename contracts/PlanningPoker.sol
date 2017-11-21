pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Project.sol';
import './TrustedOracle.sol';


contract PlanningPoker is Ownable, TrustedOracle {
  using SafeMath for uint;
  mapping (string => Voting) votings;

  Project project;

  address public projectAddress;

  struct Voting {
    string issue;
    uint votesCount;
    uint sum;
    bool isValid;
    bool isOpen;
    bool awardPaid;
    mapping (address => uint) votes;
  }

  modifier onlyTeem {
    bool result = false;
    uint length = project.getWorkersLength();
    for (uint i = 0; i < length; i++) {
      var (_address, username) = project.getWorker(i);
      if (msg.sender == _address) {
        result = true;
        break;
      }
    }
    require(result);
    _;
  }

  function PlanningPoker(address _projectContract) public {
    project = Project(_projectContract);
    projectAddress = _projectContract;
  }

  function addVoting(string issue) external onlyTrustedOracle {
    votings[issue] = Voting(issue, 0, 0, true, true, false);
  }

  function closeVoting(string issue) external onlyTrustedOracle {
    require(votings[issue].isValid);
    votings[issue].isOpen = false;
  }

  function vote(string issue, uint points) external onlyTeem {
    if (!votings[issue].isValid) {
      votings[issue] = Voting(issue, 0, 0, true, true, false);
    }
    require(votings[issue].isOpen);
    if (votings[issue].votes[msg.sender] > 0) {
      votings[issue].sum = votings[issue].sum.sub(votings[issue].votes[msg.sender]).add(points);
    } else {
      votings[issue].sum = votings[issue].sum.add(points);
      votings[issue].votesCount++;
    }
    votings[issue].votes[msg.sender] = points;
  }

  function getVote(string issue) public constant returns (uint) {
    return votings[issue].votes[msg.sender];
  }

  function getVoting(string issue) public constant returns (string, uint, uint, bool, bool) {
    return (votings[issue].issue, votings[issue].votesCount, votings[issue].sum, votings[issue].isOpen, votings[issue].awardPaid);
  }

  function markVotingAsPaid(string issue) external {
    require(msg.sender == projectAddress);
    if (votings[issue].isValid) {
      votings[issue].awardPaid = true;
    }
  }

  function setAddress(address _planningPokerContract) external onlyOwner {
    project = Project(_planningPokerContract);
    projectAddress = _planningPokerContract;
  }
}
