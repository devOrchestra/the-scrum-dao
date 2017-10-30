var Project = artifacts.require("./Project.sol");
var StoryPointsVoting = artifacts.require("./StoryPointsVoting.sol");
var ProductBacklog = artifacts.require("./ProductBacklog.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(Project,"SCRUM-DAO", "SAO", 18).then(function() {
    return deployer.deploy(StoryPointsVoting, Project.address);
  }).then(function() {
    return deployer.deploy(ProductBacklog, Project.address);
  }).then(function() {
    return deployer.deploy(Crowdsale, Project.address);
  });
};

