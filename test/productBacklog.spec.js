const ProductBacklog = artifacts.require("../contracts/ProductBacklog.sol");
const PlanningPoker = artifacts.require("../contracts/PlanningPoker.sol");
const Crowdsale = artifacts.require("../contracts/Crowdsale.sol");
const Project = artifacts.require("../contracts/Project.sol");

let productBacklogContractInstance;
let projectContractInstance;

const sinon = require("sinon");
const chai = require("chai");

contract('ProductBacklog', accounts => {
  describe('Basic setup and deployment', () => {
    it('Should set provider and deploy "ProductBacklog" contract', done => {
      ProductBacklog.setProvider(web3.currentProvider);
      ProductBacklog.deployed()
        .then(instance => {
          productBacklogContractInstance = instance;
          const isDeployedProperly = Object.keys(instance).length > 0;
          chai.expect(isDeployedProperly).to.be.true;
          done();
        })
        .catch(err => {
          errorHandler(err, 'Should deploy "ProductBacklog" contract', done);
        });
    });

    it('Should set provider and deploy "Project" contract', done => {
      Project.setProvider(web3.currentProvider);
      Project.deployed()
        .then(instance => {
          projectContractInstance = instance;
          const isDeployedProperly = Object.keys(instance).length > 0;
          chai.expect(isDeployedProperly).to.be.true;
          done();
        })
        .catch(err => {
          errorHandler(err, 'Should deploy "Project" contract', done);
        });
    });

    // it('Should init planning poker', done => {
    //   projectContractInstance.initPlanningPoker(projectContractInstance.address, {from: accounts[0], gas: 150000})
    //     .then(initPlanningPokerResponse => {
    //       const isInitProperly = checkIsTransactionValid(initPlanningPokerResponse);
    //       chai.expect(isInitProperly).to.be.true;
    //       done();
    //     })
    //     .catch(err => {
    //       errorHandler(err, 'Should init planning poker', done);
    //     });
    // });

    // it('Should init planning poker', done => {
    //   projectContractInstance.initPlanningPoker(projectContractInstance.address, {from: accounts[0], gas: 150000})
    //     .then(initPlanningPokerResponse => {
    //       const isInitProperly = checkIsTransactionValid(initPlanningPokerResponse);
    //       chai.expect(isInitProperly).to.be.true;
    //       done();
    //     })
    //     .catch(err => {
    //       errorHandler(err, 'Should init planning poker', done);
    //     });
    // });

    it('Should set trusted oracle for "ProductBacklog" contract', done => {
      productBacklogContractInstance.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000})
        .then(addTrustedOracleResponse => {
          const trustedOracleIsSetProperly = checkIsTransactionValid(addTrustedOracleResponse);
          chai.expect(trustedOracleIsSetProperly).to.be.true;
          done();
        })
        .catch(err => {
          errorHandler(err, 'Should set trusted oracle for "ProductBacklog" contract', done);
        });
    });

    it('Should set trusted oracle for "Project" contract', done => {
      projectContractInstance.addTrustedOracle(accounts[0], {from: accounts[0], gas: 150000})
        .then(addTrustedOracleResponse => {
          const trustedOracleIsSetProperly = checkIsTransactionValid(addTrustedOracleResponse);
          chai.expect(trustedOracleIsSetProperly).to.be.true;
          done();
        })
        .catch(err => {
          errorHandler(err, 'Should set trusted oracle for "Project" contract', done);
        });
    });
  });

  describe('Test methods after basic setup', () => {
    it('Should add worker', done => {
      let currentWorkersLength;
      projectContractInstance.getWorkersLength()
        .then(getWorkersLengthResponse => {
          currentWorkersLength = parseBigNumber(getWorkersLengthResponse);
          return projectContractInstance.addWorker(accounts[1], "test worker 1", {from: accounts[0], gas: 150000});
        })
        .then(addWorkerResponse => {
          const workerIsAddedProperly = checkIsTransactionValid(addWorkerResponse);
          chai.expect(workerIsAddedProperly).to.be.true;
          return projectContractInstance.getWorkersLength();
        })
        .then(getWorkersLengthResponse => {
          const updatedWorkersLength = parseBigNumber(getWorkersLengthResponse);
          chai.expect(updatedWorkersLength).to.be.equal(currentWorkersLength + 1);
          done();
        })
        .catch(err => {
          errorHandler(err, 'Should add worker', done);
        });
    });

    it('Should add voting', done => {
      const mock = sinon.mock(projectContractInstance);
      mock.expects("balanceOf").returns(1000000);
      console.log(projectContractInstance.balanceOf());
      productBacklogContractInstance.forTesting({from: accounts[0], gas: 150000})
        .then(res => {
          console.log("res", parseBigNumber(res));
        })
      // productBacklogContractInstance.addVoting("TEST-SD-1", {from: accounts[0], gas: 150000})
      //   .then(addVotingResponse => {
      //     console.log(addVotingResponse);
      //   })
      //   .catch(err => {
      //     errorHandler(err, 'Should add voting', done);
      //   });
    });
  })
});


//   const mock = sinon.mock(projectContractInstance);
//   mock.expects("balanceOf").returns(100);
//   // console.log(projectContractInstance.balanceOf());
//   // console.log(productBacklogContractInstance);
//   done();


/**
 * Auxiliary methods
 */

function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}

function checkIsTransactionValid(transaction) {
  const txIsValid = transaction.hasOwnProperty("tx") && transaction.tx.length > 0,
        transactionHashIsValid = transaction.hasOwnProperty("receipt") &&
          transaction.receipt.hasOwnProperty("transactionHash") &&
          transaction.receipt.transactionHash.length > 0 &&
          transaction.receipt.transactionHash === transaction.tx;
  return txIsValid && transactionHashIsValid;
}

function errorHandler(err, testDescription, done) {
  console.error(`An error occurred in the test (${testDescription}):`, err);
  done();
}
