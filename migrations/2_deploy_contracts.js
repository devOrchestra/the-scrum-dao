var Project = artifacts.require("./Project.sol");
var StoryPointsVoting = artifacts.require("./StoryPointsVoting.sol");

module.exports = function(deployer) {
  deployer.deploy(Project,"SCRUM-DAO", "SAO", 18).then(function() {
    return deployer.deploy(StoryPointsVoting, Project.address);
  });
};

