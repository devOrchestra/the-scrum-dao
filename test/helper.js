let Promise = require('bluebird');
let Web3 = require('web3');


let accounts = web3.eth.accounts;
let names = ['admin', 'username'];
let issues = ['NORMAL', 'CLOSED', 'NOTCOLOSED'];
let votedIssueIndex = 0;
let storyPoints = [100];


let service = {
  initialSetupToPayAward: initialSetupToPayAward,
  initialSetupAwardPayed: initialSetupAwardPayed
}

function initialSetupToPayAward(contracts, accounts) {
  projectContract = contracts[0];
  planningPokerContact = contracts[1];
  crowdsaleContract = contracts[2];
  productBacklogContract = contracts[3];

  return Promise.resolve().then(function (contracts) {
    return Promise.all([
      projectContract.initPlanningPoker(planningPokerContact.address, {from: accounts[0], gas: 150000}),
      projectContract.initCrowdsale(crowdsaleContract.address, {from: accounts[0], gas: 150000})
    ]);
  })
    .then(function () {
      let addWorkerTasks = [];
      for (let i = 1; i < names.length; i++) {
        addWorkerTasks.push(projectContract.addWorker(accounts[i], names[i], {from: accounts[0], gas: 150000}));
      }
      return Promise.all([
        projectContract.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000}),
        ...addWorkerTasks
      ]);
    })
    .then(function () {
      return planningPokerContact.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000});
    })
    .then(function () {
      return productBacklogContract.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000})
    })
    .then(function () {
      let addVotingTasks = [];
      for (let issueName of issues) {
        addVotingTasks.push(planningPokerContact.addVoting(issueName, {from: accounts[0], gas: 150000}));
      }
      return Promise.all(addVotingTasks);
    })
    .then(function () {
      let voteTasks = [];
      for (let i = 1; i < names.length; i++) {
        voteTasks.push(planningPokerContact.vote(issues[votedIssueIndex], storyPoints[Math.floor(Math.random() * storyPoints.length)], {
          from: accounts[i],
          gas: 150000
        }));
      }
      voteTasks.push(planningPokerContact.vote(issues[2], storyPoints[Math.floor(Math.random() * storyPoints.length)], {
        from: accounts[1],
        gas: 150000
      }));
      return Promise.all(voteTasks);
    })
    .then(function () {
      return Promise.all([planningPokerContact.closeVoting(issues[0], {from: accounts[0], gas: 150000}),
        planningPokerContact.closeVoting(issues[1], {from: accounts[0], gas: 150000})]);
    })
    .catch(function (error) {
      console.log(`Errors occurred: ${error.message}`);
    });
}

function initialSetupAwardPayed(contracts, accounts) {
  return initialSetupToPayAward(contracts, accounts)
    .then(function () {
      console.log(`Issue ${issues[0]}. Voting has been closed`);
      return contracts[0].payAward('username', issues[0], {from: accounts[0], gas: 150000});
    })
    .then(function () {
      console.log(`Issue ${issues[0]}. Award has been payed`);
      return true;
    })
    .catch(function (error) {
      console.log(`Errors occurred: ${error.message}`);
    });
}

module.exports = service;
