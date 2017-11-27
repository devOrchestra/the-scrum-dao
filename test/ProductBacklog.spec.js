const Project = artifacts.require("./Project");
const PlanningPoker = artifacts.require("./PlanningPoker");
const Crowdsale = artifacts.require("./Crowdsale");
const ProductBacklog = artifacts.require("./ProductBacklog");

const helper = require('./helper');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

let projectContract;
let productBacklogContract;

const holders = [];

contract('ProductBacklog', accounts => {

  describe('deploy', () => {
    before(done => {
      Project.deployed()
        .then(instance => {
          projectContract = instance;
          done();
        });
    });

    it("should deploy ProductBacklog properly", done => {
      ProductBacklog.deployed()
        .then(instance => {
          should.exist(instance.contract);
          productBacklogContract = instance;
          done();
        });
    });
  });

  describe('addTrustedOracle', () => {
    it("should set trustedOracle address for ProductBacklog", done => {
      productBacklogContract.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000})
        .then(() => {
          return productBacklogContract.trustedOracle();
        })
        .then(trustedOracle => {
          trustedOracle.should.equal(accounts[1]);
          done();
        });
    });
  });

  describe('addVoting', () => {
    it("should throw error if not TrustedOracle call addVoting for ProductBacklog", () => {
      return productBacklogContract.addVoting("SD-TEST", {from: accounts[0], gas: 150000}).should.be.rejected
    });

    it("should return invalid voting with empty fields before addVoting", done => {
      productBacklogContract.getVoting("SD-TEST", {from: accounts[0], gas: 150000})
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal('');
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(false);
          done();
        });
    });

    it("should return empty vote before addVoting", done => {
      productBacklogContract.getVote("SD-TEST", {from: accounts[0], gas: 150000})
        .then(getVoteResponse => {
          parseBigNumber(getVoteResponse[0]).should.equal(0);
          parseBigNumber(getVoteResponse[1]).should.equal(0);
          done();
        });
    });

    it("should add voting", done => {
      productBacklogContract.addVoting("SD-TEST", {from: accounts[1], gas: 150000})
        .then(() => {
          return productBacklogContract.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal('SD-TEST');
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(true);
          done();
        });
    });
  });

  describe("vote", () => {
    before(() => {
      return Promise.all([Project.deployed(), PlanningPoker.deployed(), Crowdsale.deployed(), ProductBacklog.deployed()]).then(contracts => {
        projectContract = contracts[0];
        productBacklogContract = contracts[3];
        return helper.initialSetupToPayAward(contracts, accounts);
      })
      .then(() => {
        return projectContract.payAward('username', 'NORMAL', {from: accounts[0], gas: 150000});
      })
      .then(function () {
        return projectContract.balanceOf(accounts[1]);
      })
      .then(data => {
        holders.push(accounts[1]);
      });
    });

    it("should throw error when not TokenHolder is trying to vote", () => {
      return productBacklogContract.vote("SD-TEST", {from: accounts[5], gas: 150000}).should.be.rejected
    });

    it("should vote properly when TokenHolder is voting on issue with opened voting", done => {
      productBacklogContract.vote("SD-TEST", {from: holders[0], gas: 150000})
        .then(() => {
          return productBacklogContract.getVote("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVoteResponse => {
          parseBigNumber(getVoteResponse[0]).should.equal(0);
          parseBigNumber(getVoteResponse[1]).should.equal(100000000000000000000);
          return productBacklogContract.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[1] = parseBigNumber(getVotingResponse[1]);
          getVotingResponse[2] = parseBigNumber(getVotingResponse[2]);
          getVotingResponse[0].should.equal('SD-TEST');
          getVotingResponse[1].should.equal(100000000000000000000);
          getVotingResponse[2].should.equal(100000000000000000000);
          getVotingResponse[3].should.equal(true);
          done();
        });
    });

    it("should add voting after first vote on issue without opened voting at the moment", done => {
      productBacklogContract.getVoting("SD-TEST-FOR-VOTING-OPENING", {from: holders[0], gas: 150000})
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("");
          parseBigNumber(getVotingResponse[1]).should.equal(0);
          parseBigNumber(getVotingResponse[2]).should.equal(0);
          getVotingResponse[3].should.equal(false);
          return productBacklogContract.vote("SD-TEST-FOR-VOTING-OPENING", {from: holders[0], gas: 300000});
        })
        .then(() => {
          return productBacklogContract.getVoting("SD-TEST-FOR-VOTING-OPENING", {from: holders[0], gas: 300000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("SD-TEST-FOR-VOTING-OPENING");
          parseBigNumber(getVotingResponse[1]).should.equal(100000000000000000000);
          parseBigNumber(getVotingResponse[2]).should.equal(100000000000000000000);
          getVotingResponse[3].should.equal(true);
          done();
        });
    });

    it("should throw error when trying to vote on issue with closed voting", () => {
      productBacklogContract.closeVoting("SD-TEST-FOR-VOTING-OPENING", {from: accounts[0], gas: 150000})
        .then(() => {
          return productBacklogContract.vote("SD-TEST-FOR-VOTING-OPENING", {from: holders[0], gas: 300000}).should.be.rejected;
        });
    });
  });

  describe("closeVoting", () => {
    it("should throw error when trying to close voting without trusted oracle", () => {
      return productBacklogContract.closeVoting("SD-TEST", {from: accounts[3], gas: 150000}).should.be.rejected
    });

    it("should close voting via trusted oracle", done => {
      productBacklogContract.closeVoting("SD-TEST", {from: accounts[0], gas: 150000})
        .then(() => {
          return productBacklogContract.getVoting("SD-TEST", {from: accounts[0], gas: 150000});
        })
        .then(getVotingResponse => {
          getVotingResponse[0].should.equal("SD-TEST");
          getVotingResponse[3].should.equal(false);
          done();
        });
    });
  });
});

function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
