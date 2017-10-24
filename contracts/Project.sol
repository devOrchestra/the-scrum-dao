pragma solidity ^0.4.11;


contract Project {
  address owner;

  struct UserStory {
  bytes32 hash;
  string track;
  address requestor;
  string story;
  uint date;
  uint votes;
  uint avgEstimatedTime;
  mapping (address => bool) votedPriority;
  mapping (address => bool) votedEstimatedTime;
  }

  struct SprintVoiting {
  bytes32[] sprintBacklogHashes;
  uint date;
  uint votes;
  bool started;
  bool finished;
  mapping (address => bool) voted;
  mapping (bytes32 => UserStory) sprintBacklog;
  }

  bytes32[] sprintVoitingsHashes;

  mapping (bytes32 => SprintVoiting) public sprintVoitings;

  UserStory[] public productBacklog;

  address[] public workers;

  address public master;

  address[] public investors;

  modifier onlyTeem {
    bool result = false;
    for (uint i = 0; i < workers.length; i++) {
      if (msg.sender == workers[i]) {
        result = true;
        break;
      }
    }
    if (msg.sender == master) {
      result = true;
    }
    require(result);
    _;
  }

  modifier onlyMaster {
    require(msg.sender == master);
    _;
  }

  function Project(){
    owner = msg.sender;
  }

  function setMaster(address masterAddress){
    require(msg.sender == owner);
    master = masterAddress;
  }

  function addWorker(address worker){
    require(msg.sender == owner);
    bool alreadyAdded = false;
    for (uint i = 0; i < workers.length; i++) {
      if (worker == workers[i]) {
        alreadyAdded = true;
        break;
      }
    }
    require(!alreadyAdded);
    workers.push(worker);
  }

  function getWorkersLength() public constant returns (uint){
    return workers.length;
  }

  function getWorker(uint i) public constant returns (address){
    return workers[i];
  }

  function addInvestor(address investor){
    require(msg.sender == owner);
    bool alreadyAdded = false;
    for (uint i = 0; i < investors.length; i++) {
      if (investor == investors[i]) {
        alreadyAdded = true;
        break;
      }
    }
    require(!alreadyAdded);
    investors.push(investor);
  }

  function getInvestorsLength() public constant returns (uint){
    return investors.length;
  }

  function getInvestor(uint i) public constant returns (address){
    return investors[i];
  }

  function addUserStory(string track, string story) returns (uint){
    bytes32 hash = bytes32(sha3(now, story));
    productBacklog.push(UserStory(hash, track, msg.sender, story, now, 0, 0));
    return productBacklog.length;
  }

  function votePriority(uint i){
    require(!productBacklog[i].votedPriority[msg.sender]);
    productBacklog[i].votedPriority[msg.sender] = true;
    productBacklog[i].votes += 1;
  }

  function isVoited(uint i) returns (bool){
    return productBacklog[i].votedPriority[msg.sender];
  }

  function getUserStory(uint i) public returns (string, address, string, uint, uint, uint) {
    return (productBacklog[i].track, productBacklog[i].requestor, productBacklog[i].story, productBacklog[i].date, productBacklog[i].votes, productBacklog[i].avgEstimatedTime);
  }

  function getBacklogLength() public constant returns (uint){
    return productBacklog.length;
  }

  function voteEstimatedTime(uint i, uint time) onlyTeem {
    require(!productBacklog[i].votedEstimatedTime[msg.sender]);
    productBacklog[i].votedEstimatedTime[msg.sender] = true;
    if (productBacklog[i].avgEstimatedTime > 0) {
      productBacklog[i].avgEstimatedTime = (productBacklog[i].avgEstimatedTime + time) / 2;
    }
    else {
      productBacklog[i].avgEstimatedTime = time;
    }
  }

  function initiateSprintVoiting(uint[] ids){
    bytes32 hash = bytes32(sha3(now));
    sprintVoitingsHashes.push(hash);
    sprintVoitings[hash].date = now;
    sprintVoitings[hash].votes = 0;
    sprintVoitings[hash].started = true;
    sprintVoitings[hash].finished = false;

    for (uint i = 0; i < ids.length; i++) {
      sprintVoitings[hash].sprintBacklogHashes.push(productBacklog[ids[i]].hash);
    }
  }

  function getSprintVoitingsLength() returns (uint){
    return sprintVoitingsHashes.length;
  }

  function getSprintVoitingHash(uint i) returns (bytes32){
    return sprintVoitingsHashes[i];
  }

  function getLastSprintVoiting() returns (uint, uint, bool, bool, uint, bytes32){
    SprintVoiting last = sprintVoitings[sprintVoitingsHashes[sprintVoitingsHashes.length-1]];
    return (last.date, last.votes, last.started, last.finished, last.sprintBacklogHashes.length, sprintVoitingsHashes[sprintVoitingsHashes.length-1]);
  }

  function getSprintBacklogItem(bytes32 hash, uint i) returns (string, address, string, uint, uint, uint){
    SprintVoiting sprint = sprintVoitings[hash];
    bytes32 storyHash = sprint.sprintBacklogHashes[i];
    UserStory story = sprint.sprintBacklog[storyHash];
    return (story.track, story.requestor, story.story, story.date, story.votes, story.avgEstimatedTime);
  }

  function getStoryHash() returns {

  }
//  function get
}
