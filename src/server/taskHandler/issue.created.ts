import async = require("async");

import TaskScheduler from "../taskScheduler";
import TaskHandler from "./index";
import EthController from "../ethController";
import logger from "../logger";

export default function (taskHandler: TaskHandler) {
  let {taskScheduler, ethController, config}: {taskScheduler: TaskScheduler, ethController: EthController, config} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;
    let {timeIntervals} = config.ethereum;

    logger.info(`Handling issue.created task for issue ${issueKey}`);

    async.parallel([

      (storyPointsVotingCreated) => {
        ethController.createStoryPointsVoting(issueKey, {}, storyPointsVotingCreated);
      },

      (priorityVotingCreated) => {
        ethController.createPriorityVoting(issueKey, {}, priorityVotingCreated);
      }

    ], (error) => {
      if (!error) taskScheduler.createTask('issue.storyPointsVoting.close', job.data, timeIntervals.storyPointsVoting);
      done(error);
    });
  }
}
