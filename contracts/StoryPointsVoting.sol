pragma solidity ^0.4.11;


import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Project.sol';
import './TrustedOracle.sol';


contract StoryPointsVoting is Ownable, TrustedOracle {
  using SafeMath for uint;
  mapping (string => Voiting) votings;

  Project project;

  struct Voiting {
  string issue;
  uint votesCount;
  uint sum;
  bool isValid;
  bool isOpen;
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

  function StoryPointsVoting(address _projectContract, address _trustedOracle) TrustedOracle(_trustedOracle) {
    project = Project(_projectContract);
  }

  function addVoiting(string issue) onlyTrustedOracle {
    votings[issue] = Voiting(issue, 0, 0, true, true);
  }

  function closeVoiting(string issue) onlyTrustedOracle {
    require(votings[issue].isValid);
    votings[issue].isOpen = false;
  }

  function vote(string issue, uint points) onlyTeem {
    if (!votings[issue].isValid) {
      addVoiting(issue);
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

  function getVoiting(string issue) public constant returns (uint, uint, bool){
    return (votings[issue].votesCount, votings[issue].sum, votings[issue].isOpen);
  }
}
