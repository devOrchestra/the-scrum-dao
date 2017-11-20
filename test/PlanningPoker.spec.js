const Project = artifacts.require("./Project");
const PlanningPoker = artifacts.require("./PlanningPoker");
const Crowdsale = artifacts.require("./Crowdsale");
const ProductBacklog = artifacts.require("./ProductBacklog");

const helper = require('./helper');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

let projectContract;
let planningPokerContact;
let crowdsaleContract;
let productBacklogContract;

let workerAddresses = [];

contract('PlanningPoker', accounts => {

  describe('deploy', () => {
    it("should deploy 'Project' and define 'name', 'symbol' and 'decimals'", done => {
      Project.deployed()
        .then(instance => {
          should.exist(instance.contract);
          projectContract = instance;
          return Promise.all([projectContract.name(), projectContract.symbol(), projectContract.decimals()]);
        })
        .then(data => {
          data[0].should.equal('SCRUM-DAO');
          data[1].should.equal('SCR');
          parseBigNumber(data[2]).should.equal(18);
          done();
        })
    });

    it("should deploy 'PlanningPoker' properly", done => {
      PlanningPoker.deployed()
        .then(instance => {
          should.exist(instance.contract);
          planningPokerContact = instance;
          done();
        });
    });
  });

  describe('addTrustedOracle', () => {
    it("should throw error if not Owner call addTrustedOracle for Project", done => {
      projectContract.addTrustedOracle(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected
        .then(() => {
          return projectContract.trustedOracle();
        })
        .then(data => {
          data.should.equal('0x0000000000000000000000000000000000000000');
          done();
        });
    });

    it("should set trustedOracle address for Project", done => {
      projectContract.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000})
        .then(() => {
          return projectContract.trustedOracle();
        })
        .then(trustedOracle => {
          trustedOracle.should.equal(accounts[1]);
          done();
        });
    });

    it("should throw error if not Owner call addTrustedOracle for PlanningPoker", done => {
      planningPokerContact.addTrustedOracle(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected
        .then(() => {
          return planningPokerContact.trustedOracle();
        })
        .then(data => {
          data.should.equal('0x0000000000000000000000000000000000000000');
          done();
        });
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

  describe('initPlanningPoker', () => {
    it("should throw error if not Owner call initPlanningPoker", done => {
      projectContract.initPlanningPoker(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected
        .then(() => {
          return projectContract.planningPoker();
        })
        .then(data => {
          data.should.equal('0x0000000000000000000000000000000000000000');
          done();
        });
    });

    it("should set planningPoker address", done => {
      projectContract.initPlanningPoker(accounts[0], {from: accounts[0], gas: 150000})
        .then(function () {
          return projectContract.planningPoker();
        })
        .then(planningPoker => {
          planningPoker.should.equal(accounts[0]);
          done();
        });
    });
  });

  describe('voting logic', () => {
    describe('addVoting', () => {
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

    describe("voting", () => {
      before(done => {
        projectContract.addWorker(accounts[3], "TEST-WORKER", {from: accounts[0], gas: 150000})
          .then(() => {
            workerAddresses.push(accounts[3]);
            done();
          })
          .catch(err => {
            console.error("An error occurred on PlanningPoker.spec in 'before' block of 'voting' describe:", err);
          });
      });

      it("should throw error when not Worker is trying to vote", () => {
        return planningPokerContact.vote("SD-TEST", {from: accounts[5], gas: 150000}).should.be.rejected
      });

      it("should vote properly when Worker is voting", done => {
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
          })
      });
    });

    describe("close voting", () => {
      it("should close voting without trusted oracle", () => {
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

      it("should mark voting as paid", done => {
        planningPokerContact.markVotingAsPaid("SD-TEST", {from: accounts[0], gas: 150000})
          .then((res) => {
            console.log("*********************************");
            console.log("RES", res);
            return planningPokerContact.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
          })
          .then(getVotingResponse => {
            console.log("getVotingResponse", getVotingResponse);
            done();
          });
      })
    });
  });
});

function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
