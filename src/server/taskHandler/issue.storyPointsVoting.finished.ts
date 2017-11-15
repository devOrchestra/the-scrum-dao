import TaskHandler from "./index";
import EthController from "../ethController";

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;
    ethController.closeStoryPointsVoting(issueKey, {}, done);
  }
}
