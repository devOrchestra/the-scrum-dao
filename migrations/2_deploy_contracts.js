var Project = artifacts.require("./Project.sol");
var PlanningPoker = artifacts.require("./PlanningPoker.sol");
var ProductBacklog = artifacts.require("./ProductBacklog.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(Project,"SCRUM-DAO", "SCR", 18).then(function() {
    return deployer.deploy(PlanningPoker, Project.address);
  }).then(function() {
    return deployer.deploy(ProductBacklog, Project.address);
  }).then(function() {
    return deployer.deploy(Crowdsale, Project.address);
  });
};

