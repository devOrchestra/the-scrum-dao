const Project = artifacts.require("./Project");
const PlaningPoker = artifacts.require("./PlanningPoker");
const Crowdsale = artifacts.require("./Crowdsale");
const ProductBacklog = artifacts.require("./ProductBacklog");

const helper = require('./helper')
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

let projectContract;
let planningPokerContact;
let crowdsaleContract;
let productBacklogContract;

contract('Project', function (accounts) {

  describe('deploy', () => {
    it("should define name, symbol, decimals", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return Promise.all([projectInstance.name(), projectInstance.symbol(), projectInstance.decimals()])
      }).then(function (data) {
        data[0].should.equal('SCRUM-DAO')
        data[1].should.equal('SCR')
        parseBigNumber(data[2]).should.equal(18)
      })
    });
  })

  describe('addTrustedOracle', () => {

    it("should throw error if not Owner call addTrustedOracle", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.addTrustedOracle(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected;
      }).then(function () {
        return projectInstance.trustedOracle()
      }).then(data => {
        data.should.equal('0x0000000000000000000000000000000000000000')
      })
    });

    it("should set trustedOracle address", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000});
      }).then(function () {
        return projectInstance.trustedOracle()
      }).then(planningPoker => {
        planningPoker.should.equal(accounts[1])
      });
    });
  })

  describe('initPlanningPoker', () => {

    it("should throw error if not Owner call initPlanningPoker", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.initPlanningPoker(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected;
      }).then(function () {
        return projectInstance.planningPoker()
      }).then(data => {
        data.should.equal('0x0000000000000000000000000000000000000000')
      })
    });

    it("should set planningPoker address", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.initPlanningPoker(accounts[1], {from: accounts[0], gas: 150000});
      }).then(function () {
        return projectInstance.planningPoker()
      }).then(planningPoker => {
        planningPoker.should.equal(accounts[1])
      });
    });
  })

  describe('initCrowdsale', () => {

    it("should throw error if not Owner call initCrowdsale", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.initCrowdsale(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected;
      }).then(function () {
        return projectInstance.crowdsale()
      }).then(data => {
        data.should.equal('0x0000000000000000000000000000000000000000')
      })
    });

    it("should set initCrowdsale address", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.initCrowdsale(accounts[1], {from: accounts[0], gas: 150000});
      }).then(function () {
        return projectInstance.crowdsale()
      }).then(planningPoker => {
        planningPoker.should.equal(accounts[1])
      });
    });
  })

  describe('addWorker', () => {

    it("should throw error if not Owner call addWorker", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.addWorker(accounts[1], 'username', {from: accounts[5], gas: 150000}).should.be.rejected;
      }).then(function () {
        return projectInstance.getWorkersLength()
      }).then(data => {
        parseBigNumber(data).should.equal(0)
      })
    });

    it("should add worker to workers array", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.addWorker(accounts[2], 'username1', {from: accounts[0], gas: 150000});
      }).then(function () {
        return projectInstance.getWorker(0)
      }).then(data => {
        data[0].should.equal(accounts[2])
        data[1].should.equal('username1')
      });
    });

  })

  describe('payAward', () => {

    before(() => {
      return Promise.all([Project.deployed(), PlaningPoker.deployed(), Crowdsale.deployed(), ProductBacklog.deployed()]).then(function (contracts) {
        projectContract = contracts[0];
        planningPokerContact = contracts[1];
        crowdsaleContract = contracts[2];
        productBacklogContract = contracts[3];
        return helper.initialSetupToPayAward(contracts, accounts);
      })
    })

    it("should throw error if not TrustedOracle call payAward", function () {
      return Promise.resolve().then(function (instance) {
        return projectContract.payAward('username', 'NORMAL', {from: accounts[1], gas: 150000}).should.be.rejected;
      })
    });

    it("should throw error if worker not found", function () {
      return Promise.resolve().then(function (instance) {
        return projectContract.payAward('unknown', 'NORMAL', {from: accounts[1], gas: 150000}).should.be.rejected;
      })
    });

    it("should throw error if nobody votes to issue", function () {
      return Promise.resolve().then(function (instance) {
        return projectContract.payAward('username', 'CLOSED', {from: accounts[1], gas: 150000}).should.be.rejected;
      })
    });

    it("should throw error if issue not closed", function () {
      return Promise.resolve().then(function (instance) {
        return projectContract.payAward('username', 'CLOSED', {from: accounts[1], gas: 150000}).should.be.rejected;
      })
    });

    it("should pay award to worker", function () {
      return Promise.resolve().then(function () {
        return projectContract.payAward('username', 'NORMAL', {from: accounts[0], gas: 150000});
      }).then(function () {
        return projectContract.balanceOf(accounts[1]);
      }).then(data => {
        parseBigNumber(data).should.equal(100000000000000000000)
      });
    });

    it("should throw error if award already payed", function () {
      return Promise.resolve().then(function () {
        return projectContract.payAward('username', 'NORMAL', {from: accounts[0], gas: 150000}).should.be.rejected;;
      })
    });
  })

  describe('transferToCrowdsale', ()=>{
    it("should throw error if not trusted crowdsale call function", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.transferToCrowdsale(accounts[1],50000000000000000000, {from: accounts[5], gas: 150000}).should.be.rejected;
      }).then(function () {
        return projectContract.balanceOf(accounts[1]);
      }).then(data => {
        parseBigNumber(data).should.equal(100000000000000000000)
      });
    });

    it("should throw error if not trusted crowdsale call function", function () {
      let projectInstance;
      return Project.deployed().then(function (instance) {
        projectInstance = instance
        return projectInstance.initCrowdsale(accounts[5], {from: accounts[0], gas: 150000});
      })
        .then(()=>{
        return projectInstance.transferToCrowdsale(accounts[1],50000000000000000000, {from: accounts[5], gas: 150000});
      }).then(function () {
        return projectContract.balanceOf(accounts[1]);
      }).then(data => {
        parseBigNumber(data).should.equal(50000000000000000000)
      }).then(function () {
        return projectContract.balanceOf(accounts[5]);
      }).then(data => {
        parseBigNumber(data).should.equal(50000000000000000000)
      });
    });
  })
});


function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
