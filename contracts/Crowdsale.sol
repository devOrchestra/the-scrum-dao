pragma solidity ^0.4.0;


import './Project.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';


contract Crowdsale is TrustedOracle {
  using SafeMath for uint256;

  Project public project;

  Order[] public sellOrders;

  Order[] public buyOrders;

  struct Order {
  address owner;
  uint256 value;
  uint256 price;
  uint256 id;
  bool isOpen;
  }

  function Crowdsale(address _projectContract) public {
    project = Project(_projectContract);
  }

  function addSellOrder(uint256 _value, uint256 _price) external {
    require(_price > 0 && _value > 0);
    project.transferToCrowdsale(msg.sender, _value);
    sellOrders.push(Order(msg.sender, _value, _price, sellOrders.length - 1, true));
  }

  function addBuyOrder(uint _price) external payable {
    require(_price > 0 && msg.value > 0);
    uint256 weiAmount = msg.value;
    uint256 _value = weiAmount.div(_price).mul(1000000000000000000);
    buyOrders.push(Order(msg.sender, _value, _price, buyOrders.length - 1, true));
  }

  function sell(uint _buyOrderId) external {
    Order order = buyOrders[_buyOrderId];
    uint256 weiAmount = order.value.mul(order.price).div(1000000000000000000);
    require(order.isOpen && order.value <= project.balanceOf(msg.sender));

    order.isOpen = false;
    project.transferToCrowdsale(msg.sender, order.value);
    project.transfer(order.owner, order.value);
    msg.sender.transfer(weiAmount);
  }


  function buy(uint _sellOrderId) external payable {
    uint256 weiAmount = msg.value;
    Order order = sellOrders[_sellOrderId];
    uint256 orderAmount = order.value.mul(order.price).div(1000000000000000000);
    require(order.isOpen && orderAmount <= weiAmount);

    order.isOpen = false;
    project.transfer(msg.sender, order.value);
    order.owner.transfer(weiAmount);
  }

  function closeSellOrder(uint id) external {
    Order order = sellOrders[id];
    require(order.isOpen && order.owner == msg.sender);
    order.isOpen = false;
    project.transfer(msg.sender, order.value);
  }

  function closeBuyOrder(uint id) external {
    Order order = buyOrders[id];
    require(order.isOpen && order.owner == msg.sender);
    order.isOpen = false;
    uint weiAmount = order.value.mul(order.price).div(1000000000000000000);
    order.owner.transfer(weiAmount);
  }

  function getSellOrderLength() public constant returns (uint) {
    return sellOrders.length;
  }

  function getSellOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool) {
    return (sellOrders[id].owner, sellOrders[id].value, sellOrders[id].price, sellOrders[id].id, sellOrders[id].isOpen);
  }

  function getBuyOrderLength() public constant returns (uint) {
    return buyOrders.length;
  }

  function getBuyOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool) {
    return (buyOrders[id].owner, buyOrders[id].value, buyOrders[id].price, buyOrders[id].id, buyOrders[id].isOpen);
  }
}
