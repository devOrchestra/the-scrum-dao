import async = require("async");

import TaskHandler from "./index";
import EthController from "../ethController";
import createLogger from '../logger';
let logger = createLogger('handler');

export default function (taskHandler: TaskHandler) {
  let {ethController}: {ethController: EthController} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;

    logger.info(`Handling issue.created task for issue ${issueKey}`);

    async.parallel([

      (storyPointsVotingCreated) => {
        ethController.createStoryPointsVoting(issueKey, {}, storyPointsVotingCreated);
      },

      (priorityVotingCreated) => {
        ethController.createPriorityVoting(issueKey, {}, priorityVotingCreated);
      }

    ], (error) => {
      done(error);
    });
  }
}
