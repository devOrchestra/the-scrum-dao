let Promise = require('bluebird');
let contract = require('truffle-contract');
let Web3 = require('web3');
let path = require('path');

let projectArtifact = require(path.resolve('./build/contracts/Project.json'));
let planningPokerArtifact = require(path.resolve('./build/contracts/PlanningPoker.json'));
let crowdsaleArtifact = require(path.resolve('./build/contracts/Crowdsale.json'));
let productBacklogArtifact = require(path.resolve('./build/contracts/ProductBacklog.json'));

let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
let project = contract(projectArtifact);
project.setProvider(web3.currentProvider);
let planningPoker = contract(planningPokerArtifact);
planningPoker.setProvider(web3.currentProvider);
let crowdsale = contract(crowdsaleArtifact);
crowdsale.setProvider(web3.currentProvider);
let productBacklog = contract(productBacklogArtifact);
productBacklog.setProvider(web3.currentProvider);

let accounts = web3.eth.accounts;
let names = ['admin', 'krabradosty', 'commercialsuicide', 'q2mber'];
let issues = ['SD-11', 'SD-12', 'SD-13'];
let votedIssueIndex = 0;
let storyPoints = [1, 2, 3, 5, 8, 13, 20, 40, 100];

let projectContract;
let planningPokerContact;
let crowdsaleContract;
let productBacklogContract;
Promise
  .all([
    project.deployed(),
    planningPoker.deployed(),
    crowdsale.deployed(),
    productBacklog.deployed()
  ])
  .then(function (contracts) {
    projectContract = contracts[0];
    planningPokerContact = contracts[1];
    crowdsaleContract = contracts[2];
    productBacklogContract = contracts[3];

    let addWorkerTasks = [];
    for (let i = 1; i < names.length; i++) {
      addWorkerTasks.push(projectContract.addWorker(accounts[i], names[i], {from: accounts[0], gas: 150000}));
    }
    return Promise.all(addWorkerTasks);
  })
  .then(function () {
    console.log(`Workers have been added`);
    let addVotingTasks = [];
    for (let issueName of issues) {
      addVotingTasks.push(planningPokerContact.addVoting(issueName, {from: accounts[0], gas: 150000}));
    }
    return Promise.all(addVotingTasks);
  })
  .then(function () {
    console.log(`Votings have been added on Planning Poker`);
    let voteTasks = [];
    for (let i = 1; i < names.length; i++) {
      voteTasks.push(planningPokerContact.vote(issues[votedIssueIndex], storyPoints[Math.floor(Math.random()*storyPoints.length)],{from: accounts[i], gas: 150000}));
    }
    return Promise.all(voteTasks);
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. All workers have been voted on Planning Poker issues`);
    return planningPokerContact.closeVoting(issues[votedIssueIndex], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Voting has been closed on Planning Poker`);
    return projectContract.payAward('krabradosty', issues[votedIssueIndex], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Award has been payed for "krabradosty"`);
    let addVotingTasks = [];
    for (let issueName of issues) {
      addVotingTasks.push(productBacklogContract.addVoting(issueName, {from: accounts[0], gas: 150000}));
    }
    return Promise.all(addVotingTasks);
  })
  .then(function () {
    console.log(`Votings have been added on Product Backlog`);
    let voteTasks = [];
    voteTasks.push(productBacklogContract.vote(issues[votedIssueIndex], {from: accounts[1], gas: 150000}));
    return Promise.all(voteTasks);
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Token holder have been voted on Product Backlog`);
    return productBacklogContract.closeVoting(issues[votedIssueIndex], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Voting has been closed on Product Backlog`);
    console.log(`***SUCCESS***`);
  })
  .catch(function (error) {
    console.log(`Errors occurred: ${error.message}`);
  });
