import TaskHandler from "./index";
import EthController from "../ethController";

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey, assignee} = job.data;
    ethController.payIssueAward(assignee, issueKey, {}, done);
  }
}
