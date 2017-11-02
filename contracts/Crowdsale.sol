pragma solidity ^0.4.0;


import './Project.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TrustedOracle.sol';


contract Crowdsale is TrustedOracle {
  using SafeMath for uint256;

  Project project;

  Order [] sellOrders;

  uint minSellPrice;

  Order [] buyOrders;

  uint maxBuyPrice = 0;

  struct Order {
  address owner;
  uint256 value;
  uint256 price;
  uint256 id;
  bool isOpen;
  bool isLocked;
  }

  function Crowdsale(address _projectContract){
    project = Project(_projectContract);
  }

  function addSellOrder(uint256 _value, uint256 _price){
    require(_price > 0 && _value > 0);
    if (sellOrders.length == 0) {
      minSellPrice = _price;
    }
    else {
      require(_price > maxBuyPrice);
      if (_price < minSellPrice) {
        minSellPrice = _price;
      }
    }
    project.transferToCrowdsale(msg.sender, _value);
    sellOrders.push(Order(msg.sender, _value, _price, sellOrders.length - 1, true, false));
  }

  function getSellOrderLength() public constant returns (uint){
    return sellOrders.length;
  }

  function getSellOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool){
    return (sellOrders[id].owner, sellOrders[id].value, sellOrders[id].price, sellOrders[id].id, sellOrders[id].isOpen, sellOrders[id].isLocked);
  }

  function addBuyOrder(uint _price) public payable {
    require(_price > 0);
    if (sellOrders.length != 0) {
      require(minSellPrice > _price);
    }
    if (_price > maxBuyPrice) {
      maxBuyPrice = _price;
    }
    uint256 weiAmount = msg.value;
    uint256 _value = weiAmount.div(_price);
    buyOrders.push(Order(msg.sender, _value, _price, buyOrders.length - 1, true, false));
  }

  function getBuyOrderLength() public constant returns (uint){
    return buyOrders.length;
  }

  function getBuyOrder(uint id) public constant returns (address, uint256, uint256, uint256, bool){
    return (buyOrders[id].owner, buyOrders[id].value, buyOrders[id].price, buyOrders[id].id, buyOrders[id].isOpen, buyOrders[id].isLocked);
  }

  function sell(uint _buyOrderId){
    Order order = buyOrders[_buyOrderId];
    uint256 weiAmount = order.value.mul(order.price);
    require(!order.isLocked && order.isOpen && order.value <= project.balanceOf(msg.sender));

    project.transferToCrowdsale(msg.sender, order.value);
    msg.sender.transfer(weiAmount);
    project.transfer(order.owner, order.value);
  }

  function buy(uint _sellOrderId) public payable {
    uint256 weiAmount = msg.value;
    Order order = sellOrders[_sellOrderId];
    uint256 orderAmount = order.value.mul(order.value);
    require(!order.isLocked && order.isOpen && orderAmount <= weiAmount);

    order.isOpen = false;
    order.owner.transfer(weiAmount);
    project.transfer(msg.sender, order.value);
  }

  function lockOrder(uint id, string type){
    Order order;
    if (type == 'sell') {
      order = sellOrders[id];
    }
    else if (type == 'buy') {
      order = buyOrders[id];
    }

    require(order.owner == msg.owner && order.isOpen);
    order.isLocked == true;
  }

  function closeOrder(uint id, string type) onlyTrustedOracle {
    if (type == 'sell') {
      order = sellOrders[id];
    }
    else if (type == 'buy') {
      order = buyOrders[id];
    }

    require(order.isLocked && !order.isOpen);
    order.isOpen = true;
    if (type == 'sell') {
      project.transfer(msg.sender, order.value);
    }
    else if (type == 'buy') {
      weiAmount = order.value.mul(order.price);
      order.owner.transfer(weiAmount);
    }
  }
}
