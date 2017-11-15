import async = require("async");

import TaskScheduler from "../taskScheduler";
import TaskHandler from "./index";
import EthController from "../ethController";

export default function (taskHandler: TaskHandler) {
  let {taskScheduler, ethController, config}: {taskScheduler: TaskScheduler, ethController: EthController, config} = taskHandler;

  return function (job, done) {
    let {issueKey} = job.data;
    let {timeIntervals} = config.ethereum;

    async.parallel([

      (storyPointsVotingCreated) => {
        ethController.createStoryPointsVoting(issueKey, {}, storyPointsVotingCreated);
      },

      (priorityVotingCreated) => {
        ethController.createPriorityVoting(issueKey, {}, priorityVotingCreated);
      }

    ], (error) => {
      taskScheduler.createTask('issue.storyPointsVoting.finished', job.data, timeIntervals.storyPointsVoting);
      done(error);
    });
  }
}
