const Project = artifacts.require("./Project");
const PlaningPoker = artifacts.require("./PlanningPoker");
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

contract('ProductBacklog', accounts => {

  describe('deploy', () => {
    it("should deploy 'Project' and define 'name', 'symbol' and 'decimals'", done => {
      Project.deployed().then(function (instance) {
        should.exist(instance.contract);
        projectContract = instance;
        return Promise.all([projectContract.name(), projectContract.symbol(), projectContract.decimals()])
      }).then(function (data) {
        data[0].should.equal('SCRUM-DAO');
        data[1].should.equal('SCR');
        parseBigNumber(data[2]).should.equal(18);
        done();
      })
    });

    it("should deploy 'ProductBacklog' properly", done => {
      ProductBacklog.deployed().then(function (instance) {
        should.exist(instance.contract);
        productBacklogContract = instance;
        done();
      });
    });
  });

  describe('addTrustedOracle', () => {
    it("should throw error if not Owner call addTrustedOracle", done => {
      projectContract.addTrustedOracle(accounts[1], {from: accounts[5], gas: 150000}).should.be.rejected
        .then(function () {
          return projectContract.trustedOracle()
        }).then(data => {
          data.should.equal('0x0000000000000000000000000000000000000000');
          done();
        })
    });

    it("should set trustedOracle address", done => {
      projectContract.addTrustedOracle(accounts[1], {from: accounts[0], gas: 150000})
        .then(function () {
          return projectContract.trustedOracle()
        }).then(trustedOracle => {
          trustedOracle.should.equal(accounts[1]);
          done();
        });
    });
  });

  // describe("add voting", () => {
  //   it("should add voting", function () {
  //     productBacklogContract.addVoting("SD-11", {from: accounts[0], gas: 150000})
  //       .then(data => {
  //         console.log("DATA", data);
  //       })
  //   })
  // });

});

function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
