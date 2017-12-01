const Project = artifacts.require("./Project");
const PlanningPoker = artifacts.require("./PlanningPoker");

const helper = require('./helper');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

let projectContract;
let planningPokerContact;

let workerAddresses = [];

contract('PlanningPoker', accounts => {

  describe('deploy', () => {
    before(done => {
      Project.deployed()
        .then(instance => {
          projectContract = instance;
          done();
        });
    });

    it("should deploy PlanningPoker properly", done => {
      PlanningPoker.deployed()
        .then(instance => {
          should.exist(instance.contract);
          planningPokerContact = instance;
          done();
        });
    });
  });

  describe('addTrustedOracle', () => {
    before(done => {
      projectContract.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000})
        .then(() => {
          done();
        })
    });

    it("should throw error if not Owner call addTrustedOracle for PlanningPoker", () => {
      return planningPokerContact.addTrustedOracle(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected
    });

    it("should set trustedOracle address for PlanningPoker", done => {
      planningPokerContact.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000})
        .then(() => {
          return planningPokerContact.trustedOracle();
        })
        .then(trustedOracle => {
          trustedOracle.should.equal(accounts[1]);
          done();
        });
    });
  });

  describe('addVoting', () => {
    before(done => {
      projectContract.initPlanningPoker(accounts[0], {from: accounts[0], gas: 150000})
        .then(() => {
          return projectContract.planningPoker();
        })
        .then(planningPoker => {
          done();
        });
    });

    it("should throw error if not Owner call addVoting for PlanningPoker", () => {
      return planningPokerContact.addVoting("SD-TEST", {from: accounts[0], gas: 150000}).should.be.rejected
    });

    it("should return invalid voting with empty fields before addVoting", done => {
      planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000})
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal('');
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(false);
          getVotingResponse[4].should.equal(false);
          done();
        });
    });

    it("should return empty vote before addVoting", done => {
      planningPokerContact.getVote("SD-TEST", {from: accounts[0], gas: 150000})
        .then(getVoteResponse => {
          parseBigNumber(getVoteResponse).should.equal(0);
          done();
        });
    });

    it("should add voting", done => {
      planningPokerContact.addVoting("SD-TEST", {from: accounts[1], gas: 150000})
        .then(() => {
          return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal('SD-TEST');
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(true);
          getVotingResponse[4].should.equal(false);
          done();
        });
    });
  });

  describe("vote", () => {
    before(done => {
      projectContract.addWorker(accounts[3], "TEST-WORKER", {from: accounts[0], gas: 150000})
        .then(() => {
          workerAddresses.push(accounts[3]);
          done();
        });
    });

    it("should throw error when not Worker is trying to vote", () => {
      return planningPokerContact.vote("SD-TEST", {from: accounts[5], gas: 150000}).should.be.rejected
    });

    it("should vote properly when Worker is voting on issue with opened voting", done => {
      planningPokerContact.vote("SD-TEST", 100, {from: workerAddresses[0], gas: 150000})
        .then(() => {
          return Promise.all([
            planningPokerContact.getVote("SD-TEST", {from: accounts[0], gas: 150000}),
            planningPokerContact.getVote("SD-TEST", {from: workerAddresses[0], gas: 150000}),
          ]);
        })
        .then(getVoteResponse => {
          parseBigNumber(getVoteResponse[0]).should.equal(0);
          parseBigNumber(getVoteResponse[1]).should.equal(100);
          return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[1] = parseBigNumber(getVotingResponse[1]);
          getVotingResponse[2] = parseBigNumber(getVotingResponse[2]);
          getVotingResponse[0].should.equal('SD-TEST');
          getVotingResponse[1].should.equal(1);
          getVotingResponse[2].should.equal(100);
          getVotingResponse[3].should.equal(true);
          getVotingResponse[4].should.equal(false);
          done();
        });
    });

    it("should add voting after first vote on issue without opened voting at the moment", done => {
      planningPokerContact.getVoting("SD-TEST-FOR-VOTING-OPENING", {from: workerAddresses[0], gas: 150000})
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("");
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(false);
          getVotingResponse[4].should.equal(false);
          return planningPokerContact.vote("SD-TEST-FOR-VOTING-OPENING", 100, {from: workerAddresses[0], gas: 300000});
        })
        .then(() => {
          return planningPokerContact.getVoting("SD-TEST-FOR-VOTING-OPENING", {from: workerAddresses[0], gas: 300000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("SD-TEST-FOR-VOTING-OPENING");
          parseBigNumber(getVotingResponse[1]).should.equal(1);
          parseBigNumber(getVotingResponse[2]).should.equal(100);
          getVotingResponse[3].should.equal(true);
          getVotingResponse[4].should.equal(false);
          done();
        });
    });

    it("should throw error when trying to vote on issue with closed voting", () => {
      planningPokerContact.closeVoting("SD-TEST-FOR-VOTING-OPENING", {from: accounts[1], gas: 150000})
        .then(() => {
          return planningPokerContact.vote("SD-TEST-FOR-VOTING-OPENING", {from: accounts[1], gas: 300000}).should.be.rejected;
        });
    });
  });

  describe("initProject", () => {
    it("should throw error if not Owner is trying to set address", () => {
      return planningPokerContact.initProject(accounts[0], {from: accounts[1], gas: 150000}).should.be.rejected
    });

    it("should set address for Planning Poker", done => {
      planningPokerContact.initProject(accounts[0], {from: accounts[0], gas: 150000})
        .then(() => {
          return planningPokerContact.projectAddress();
        })
        .then(projectAddressResponse => {
          projectAddressResponse.should.equal(accounts[0]);
          done();
        })
    });
  });

  describe("closeVoting", () => {
    it("should throw error when trying to close voting without trusted oracle", () => {
      return planningPokerContact.closeVoting("SD-TEST", {from: accounts[3], gas: 150000}).should.be.rejected
    });

    it("should close voting via trusted oracle", done => {
      planningPokerContact.closeVoting("SD-TEST", {from: accounts[1], gas: 150000})
        .then(() => {
          return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("SD-TEST");
          getVotingResponse[3].should.equal(false);
          done();
        });
    });
  });

  describe("markVotingAsPaid", () => {
    it("should throw error when not Owner is trying to mark voting as paid", () => {
      return planningPokerContact.markVotingAsPaid("SD-TEST", {from: accounts[1], gas: 150000}).should.be.rejected
    });

    it("should mark voting as paid", done => {
      planningPokerContact.markVotingAsPaid("SD-TEST", {from: accounts[0], gas: 150000})
        .then(() => {
          return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(() => {
          return planningPokerContact.projectAddress();
        })
        .then(projectAddressResponse => {
          projectAddressResponse.should.equal(accounts[0]);
          done();
        });
    });

    it("should throw error when trying to vote on issue with closed voting and payed award", () => {
      return Promise.resolve()
        .then(() => {
          return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("SD-TEST");
          getVotingResponse[3].should.equal(false);
          getVotingResponse[4].should.equal(true);
          return planningPokerContact.vote("SD-TEST", 40, {from: workerAddresses[0], gas: 300000}).should.be.rejected;
        });
    });
  });
});

function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
