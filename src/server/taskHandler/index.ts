import kue = require('kue');

import TaskScheduler from "../taskScheduler";
import getIssueCreatedHandler from './issue.created';
import getDevelopmentFinishedHandler from './issue.development.finished';
import getDevelopmentStartedHandler from './issue.development.started';
import EthController from "../ethController";
import createLogger from '../logger';
let logger = createLogger('handler');

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
      logger.info('Task Handler is initialized');
    });

  }

  private createHandler(eventName: string, handler: (job, done) => void): void {
    this.handler.process(eventName, handler);
    logger.info(`Handler for ${eventName} has been added`);
  }
}

export default TaskHandler;
