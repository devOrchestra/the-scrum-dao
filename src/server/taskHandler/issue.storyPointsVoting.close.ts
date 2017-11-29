import TaskHandler from "./index";
import EthController from "../ethController";
import {logger} from "codelyzer/util/logger";

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;
    logger.info(`Handling issue.storyPointsVoting.close task for issue ${issueKey}`);
    ethController.closeStoryPointsVoting(issueKey, {}, done);
  }
}
