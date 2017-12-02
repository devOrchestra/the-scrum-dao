let Project = artifacts.require("./Project.sol");
let PlanningPoker = artifacts.require("./PlanningPoker.sol");
let ProductBacklog = artifacts.require("./ProductBacklog.sol");
let Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer) {
  deployer
    .deploy(Project, "SCRUM-DAO", "SCR", 18)
    .then(() => {
      return Promise.all([
        deployer.deploy(PlanningPoker, Project.address),
        deployer.deploy(ProductBacklog, Project.address),
        deployer.deploy(Crowdsale, Project.address)
      ]);
    });
};
