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

contract('Crowdsale', function (accounts) {

  before(() => {
    return Promise.all([Project.deployed(), PlaningPoker.deployed(), Crowdsale.deployed(), ProductBacklog.deployed()]).then(function (contracts) {
      projectContract = contracts[0];
      planningPokerContact = contracts[1];
      crowdsaleContract = contracts[2];
      productBacklogContract = contracts[3];
      return helper.initialSetupAwardPayed(contracts, accounts)
    })
  })

  describe('deploy', () => {
    it("should define project after deployment", function () {
      return Crowdsale.deployed().then(function (instances) {
        return crowdsaleContract.project()
      }).then(function (data) {
        data.should.equal(projectContract.address)
      })
    });
  })

  describe('addSellOrder', () => {

    it("should throw error if price == 0", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.addSellOrder(10, 0, {from: accounts[1], gas: 500000}).should.be.rejected;
      })
    });

    it("should throw error if value == 0", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.addSellOrder(0, 10, {from: accounts[1], gas: 500000}).should.be.rejected;
      })
    });

    it("should transfer tokens to Crowdsale and push new order", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.addSellOrder(
          50000000000000000000, // 50 Tokens
          100000000000000000, // 0.1 ETH
          {from: accounts[1], gas: 500000});
      }).then(function () {
        return projectContract.balanceOf(accounts[1]);
      }).then(data => {
        parseBigNumber(data).should.equal(50000000000000000000)
      }).then(function () {
        return projectContract.balanceOf(crowdsaleContract.address);
      }).then(data => {
        parseBigNumber(data).should.equal(50000000000000000000)
      }).then(() => {
        return crowdsaleContract.getSellOrder(0)
      }).then(order => {
        order[0].should.equal(accounts[1])
        parseBigNumber(order[1]).should.equal(50000000000000000000)
        parseBigNumber(order[2]).should.equal(100000000000000000)
        parseBigNumber(order[3]).should.equal(0)
        order[4].should.equal(true)
      })
    });
  })

  describe('addBuyOrder', () => {

    it("should throw error if price == 0", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.addBuyOrder(0, {
          from: accounts[1],
          gas: 500000,
          value: 50000000000000000000
        }).should.be.rejected;
      })
    });

    it("should throw error if value == 0", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.addBuyOrder(1, {from: accounts[1], gas: 500000}).should.be.rejected;
      })
    });

    it("should deposit Crowdsale by ether and push new order", function () {
      let initialBalance;
      return Crowdsale.deployed()
        .then(function () {
          return web3.eth.getBalance(crowdsaleContract.address);
        })
        .then(data => {
          initialBalance = parseBigNumber(data)
        })
        .then(function (instance) {
          return crowdsaleContract.addBuyOrder(250000000000000000, {
            from: accounts[3],
            gas: 500000,
            value: 1000000000000000000
          });
        })
        .then(function () {
          return web3.eth.getBalance(crowdsaleContract.address);
        })
        .then(data => {
          (parseBigNumber(data)-initialBalance).should.equal(1000000000000000000)
        })
        .then(() => {
          return crowdsaleContract.getBuyOrder(0)
        })
        .then(order => {
          order[0].should.equal(accounts[3])
          parseBigNumber(order[1]).should.equal(4000000000000000000)
          parseBigNumber(order[2]).should.equal(250000000000000000)
          parseBigNumber(order[3]).should.equal(0)
          order[4].should.equal(true)
        })
    });
  })

  describe('buy', () => {

    it("should throw error if user pays less than needed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.buy(0, {
          from: accounts[2],
          gas: 500000,
          value: 1000000000000000000 // 1 ETH
        }).should.be.rejected;
      })
    });

    it("should close order and send ETH and Tokens to perticipants", function () {
      let initialBalance;
      let initialBalanceCrowdsale;
      return Crowdsale.deployed()
        .then(function () {
          return web3.eth.getBalance(accounts[1]);
        }).then(data => {
          initialBalance = parseBigNumber(data)
        })
        .then(function () {
          return projectContract.balanceOf(crowdsaleContract.address);
        }).then(data => {
          initialBalanceCrowdsale = parseBigNumber(data)
        })
        .then(function (instance) {
          return crowdsaleContract.buy(0, {
            from: accounts[2],
            gas: 500000,
            value: 5000000000000000000 // 5 ETH
          });
        }).then(function () {
          return projectContract.balanceOf(accounts[2]);
        }).then(data => {
          parseBigNumber(data).should.equal(50000000000000000000)
        }).then(function () {
          return web3.eth.getBalance(accounts[1]);
        }).then(data => {
          let endingBalance = parseBigNumber(data);
          parseBigNumber(endingBalance - initialBalance).should.equal(5000000000000000000)
        }).then(function () {
          return projectContract.balanceOf(crowdsaleContract.address);
        }).then(data => {
          (initialBalanceCrowdsale - parseBigNumber(data)).should.equal(50000000000000000000)
        }).then(() => {
          return crowdsaleContract.getSellOrder(0)
        }).then(order => {
          order[4].should.equal(false)
        })
    });

    it("should throw error if order already closed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.buy(0, {
          from: accounts[2],
          gas: 500000,
          value: 5000000000000000000 // 5 ETH
        }).should.be.rejected;
      })
    });
  })

  describe('sell', () => {

    it("should throw error if user has less tokens than needed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.sell(0, {
          from: accounts[8],
          gas: 500000
        }).should.be.rejected;
      })
    });

    it("should close order and send ETH and Tokens to perticipants", function () {
      let initialBalance;
      return Crowdsale.deployed()
        .then(function () {
          return web3.eth.getBalance(accounts[1]);
        }).then(data => {
          initialBalance = parseBigNumber(data)
        })
        .then(function (instance) {
          return crowdsaleContract.sell(0, {
            from: accounts[1],
            gas: 500000
          });
        })
        .then(function (data) {
          return projectContract.balanceOf(accounts[3]);
        }).then(data => {
          parseBigNumber(data).should.equal(4000000000000000000)
        })
        .then(function () {
          return web3.eth.getBalance(accounts[1]);
        })
        .then(data => {
          let endingBalance = parseBigNumber(data);
          (parseBigNumber(endingBalance) - initialBalance).should.to.be.above(900000000000000000)
        }).then(() => {
          return crowdsaleContract.getBuyOrder(0)
        }).then(order => {
          order[4].should.equal(false)
        })
    });

    it("should throw error if order already closed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.sell(0, {
          from: accounts[1],
          gas: 500000
        }).should.be.rejected;
      })
    });
  })

  describe('closeSellOrder', () => {

    it("should throw error if order already closed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.closeSellOrder(0, {
          from: accounts[1],
          gas: 500000
        }).should.be.rejected;
      })
    });

    it("should throw error if no owner tries to close order", function () {
      return Crowdsale.deployed()
        .then(function (instance) {
          return crowdsaleContract.addSellOrder(
            5000000000000000000, // 5 Tokens
            100000000000000000, // 0.1 ETH
            {from: accounts[1], gas: 500000});
        }).then(function () {
          return crowdsaleContract.closeSellOrder(1, {
            from: accounts[2],
            gas: 500000
          }).should.be.rejected;
        })
    });

    it("should transfer tokens to owner and close order", function () {
      let initialBalance;
      return Crowdsale.deployed()
        .then(function () {
          return projectContract.balanceOf(accounts[1]);
        })
        .then(function (data) {
          initialBalance = parseBigNumber(data)
          return crowdsaleContract.addSellOrder(
            5000000000000000000, // 5 Tokens
            100000000000000000, // 0.1 ETH
            {from: accounts[1], gas: 500000});
        })
        .then(() => {
          return crowdsaleContract.closeSellOrder(2, {
            from: accounts[1],
            gas: 500000
          })
        })
        .then(function () {
          return projectContract.balanceOf(accounts[1]);
        })
        .then(function (data) {
          (parseBigNumber(data) - initialBalance).should.to.be.equal(0)
        })
    });
  })

  describe('closeBuyOrder', () => {

    it("should throw error if order already closed", function () {
      return Crowdsale.deployed().then(function (instance) {
        return crowdsaleContract.closeBuyOrder(0, {
          from: accounts[1],
          gas: 500000
        }).should.be.rejected;
      })
    });

    it("should throw error if no owner tries to close order", function () {
      return Crowdsale.deployed()
        .then(function (instance) {
          return crowdsaleContract.addBuyOrder(250000000000000000, {
            from: accounts[2],
            gas: 500000,
            value: 1000000000000000000
          });
        }).then(function () {
          return crowdsaleContract.closeSellOrder(1, {
            from: accounts[2],
            gas: 500000
          }).should.be.rejected;
        })
    });

    it("should transfer tokens to owner and close order", function () {
      let initialBalance;
      return Crowdsale.deployed()
        .then(function (data) {
          return crowdsaleContract.addBuyOrder(250000000000000000, {
            from: accounts[2],
            gas: 500000,
            value: 1000000000000000000
          });
        })
        .then(function () {
          return web3.eth.getBalance(accounts[2]);
        })
        .then((data) => {
          initialBalance = parseBigNumber(data)
          return crowdsaleContract.closeBuyOrder(2, {
            from: accounts[2],
            gas: 500000
          })
        })
        .then(function () {
          return web3.eth.getBalance(accounts[2]);
        })
        .then(function (data) {
          parseBigNumber(data).should.to.be.above(initialBalance)
        })
    });
  })
});


function parseBigNumber(item) {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
}
