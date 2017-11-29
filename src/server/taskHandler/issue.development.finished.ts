import TaskHandler from "./index";
import EthController from "../ethController";
import logger from "../logger";

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey, assignee} = job.data;
    logger.info(`Handling issue.development.finished task for issue ${issueKey}`);
    ethController.payIssueAward(assignee, issueKey, {}, done);
  }
}
