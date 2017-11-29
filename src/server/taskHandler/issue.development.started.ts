import TaskHandler from "./index";
import EthController from "../ethController";
import logger from "../logger";

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;
    logger.info(`Handling issue.development.started task for issue ${issueKey}`);
    ethController.closePriorityVoting(issueKey, {}, done);
  }
}
