import kue = require('kue');

import logger from '../logger';
import TaskScheduler from "../taskScheduler";
import getIssueCreatedHandler from './issue.created';
import getDevelopmentFinishedHandler from './issue.development.finished';
import getDevelopmentStartedHandler from './issue.development.started';
import getSPVotingCloseHandler from './issue.storyPointsVoting.close';
import EthController from "../ethController";

class TaskHandler {

  constructor(config) {
    this.config = config;
    this.handler = kue.createQueue(config.scheduler);
    this.taskScheduler = new TaskScheduler(config);
    this.ethController = new EthController('SD', config);
  }

  // FIELDS
  public config: any;
  private handler: kue.Queue;
  public taskScheduler: TaskScheduler;
  public ethController: EthController;

  // METHODS
  public init(done): void {
    this.ethController.init((error) => {
      if (error) return done(error);
      this.createHandler('issue.created', getIssueCreatedHandler(this));
      this.createHandler('issue.development.finished', getDevelopmentFinishedHandler(this));
      this.createHandler('issue.development.started', getDevelopmentStartedHandler(this));
      this.createHandler('issue.storyPointsVoting.finished', getSPVotingCloseHandler(this));
      logger.info('Task Handler is initialized');
    });

  }

  private createHandler(eventName: string, handler: (job, done) => void): void {
    this.handler.process(eventName, handler);
    logger.info(`Handler for ${eventName} has been added`)
  }
}

export default TaskHandler;
