let Promise = require('bluebird');
let contract = require('truffle-contract');
let Web3 = require('web3');

let projectArtifact = require('./build/contracts/Project.json');
let storyPointsVotingArtifact = require('./build/contracts/StoryPointsVoting.json');
let crowdsaleArtifact = require('./build/contracts/Crowdsale.json')
let productBacklogArtifact = require('./build/contracts/ProductBacklog.json')

let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
let project = contract(projectArtifact);
project.setProvider(web3.currentProvider);
let storyPointsVoting = contract(storyPointsVotingArtifact);
storyPointsVoting.setProvider(web3.currentProvider);
let crowdsale = contract(crowdsaleArtifact)
crowdsale.setProvider(web3.currentProvider);
let productBacklog = contract(productBacklogArtifact)
productBacklog.setProvider(web3.currentProvider);

let accounts = web3.eth.accounts;
let names = ['admin', 'krabradosty', 'commercialsuicide', 'q2mber'];
let issues = ['SD-11', 'SD-12', 'SD-13'];
let votedIssueIndex = 0;
let storyPoints = [1, 2, 3, 5, 8, 13, 20, 40, 100];

let projectContract;
let storyPointsVotingContact;
let crowdsaleContract;
let productBacklogContract;
Promise
  .all([
    project.deployed(),
    storyPointsVoting.deployed(),
    crowdsale.deployed(),
    productBacklog.deployed()
  ])
  .then(function (contracts) {
    projectContract = contracts[0];
    storyPointsVotingContact = contracts[1];
    crowdsaleContract = contracts[2];
    productBacklogContract = contracts[3]
    return Promise.all([
      projectContract.initStoryPointsVoting(storyPointsVotingContact.address, {from: accounts[0], gas: 150000}),
      projectContract.initCrowdsale(crowdsaleContract.address, {from: accounts[0], gas: 150000})
    ]);
  })
  .then(function () {
    console.log(`Project contract has been initialized with Story points voting and crowdsale contracts`);
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
    console.log(`Trusted oracle for Project has been added`);
    console.log(`Workers have been added`);
    return storyPointsVotingContact.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Trusted oracle for StoryPointsVoting has been added`);
    return productBacklogContract.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000})
  })
  .then(function () {
    console.log(`Trusted oracle for ProductBacklog has been added`);
    let addVotingTasks = [];
    for (let issueName of issues) {
      addVotingTasks.push(storyPointsVotingContact.addVoting(issueName, {from: accounts[0], gas: 150000}));
    }
    return Promise.all(addVotingTasks);
  })
  .then(function () {
    console.log(`Votings have been added`);
    let voteTasks = [];
    for (let i = 1; i < names.length; i++) {
      voteTasks.push(storyPointsVotingContact.vote(issues[votedIssueIndex], storyPoints[Math.floor(Math.random()*storyPoints.length)],{from: accounts[i], gas: 150000}));
    }
    return Promise.all(voteTasks);
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. All workers have been voted`);
    return storyPointsVotingContact.closeVoting(issues[votedIssueIndex], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Voting has been closed`);
    return projectContract.payAward('krabradosty', issues[votedIssueIndex], {from: accounts[0], gas: 150000});
  })
  .then(function () {
    console.log(`Issue ${issues[votedIssueIndex]}. Award has been payed`);
  })
  .catch(function (error) {
    console.log(`Errors occurred: ${error.message}`);
  });
