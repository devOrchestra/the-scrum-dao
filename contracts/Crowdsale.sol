pragma solidity ^0.4.0;


import './Project.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract Crowdsale {
  using SafeMath for uint256;

  Project project;

  Order [] sellOrders;

  Order [] buyOrders;

  struct Order {
  address owner;
  uint256 value;
  uint256 price;
  uint256 id;
  bool isOpen;
  }


  function Crowdsale(address _projectContract){
    project = Project(_projectContract);
  }

  function addSellOrder(uint256 _value, uint256 _price){
    project.transferToCrowdsale(msg.sender, _value);
    sellOrders.push(Order(msg.sender, _value, _price, sellOrders.length - 1, true));
  }

  function getSellOrderLength() public constant returns (uint){
    return sellOrders.length;
  }

  function getSellOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool){
    return (sellOrders[id].owner, sellOrders[id].value, sellOrders[id].price, sellOrders[id].id, sellOrders[id].isOpen);
  }

  function addBuyOrder(uint _price) public payable {
    uint256 weiAmount = msg.value;
    uint256 _value = weiAmount.div(_price);
    buyOrders.push(Order(msg.sender, _value, _price, buyOrders.length - 1, true));
  }

  function getBuyOrderLength() public constant returns (uint){
    return buyOrders.length;
  }

  function getBuyOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool){
    return (buyOrders[id].owner, buyOrders[id].value, buyOrders[id].price, buyOrders[id].id, buyOrders[id].isOpen);
  }

  function sell(uint _buyOrderId){
    Order order = buyOrders[_buyOrderId];
    uint256 weiAmount = order.value.mul(order.price);
    require(order.isOpen && order.value <= project.balanceOf(msg.sender));

    project.transferToCrowdsale(msg.sender, order.value);
    msg.sender.transfer(weiAmount);
    project.transfer(order.owner, order.value);
  }

  function buy(uint _sellOrderId) public payable {
    uint256 weiAmount = msg.value;
    Order order = sellOrders[_sellOrderId];
    uint256 orderAmount = order.value.mul(order.value);
    require(order.isOpen && orderAmount <= weiAmount);

    order.isOpen = false;
    order.owner.transfer(weiAmount);
    project.transfer(msg.sender, order.value);
  }
}
