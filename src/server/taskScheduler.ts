import kue = require('kue');

import logger from './logger';

class TaskScheduler {

  constructor(config) {
    this.config = config;
    this.scheduler = kue.createQueue(config.scheduler);
    logger.info('Task Scheduler is initialized');
  }

  // FIELDS
  private config: any;
  private scheduler: kue.Queue;

  // METHODS
  public createTask(type: string, data: any, period: number): void {
    this.scheduler
      .create(type, data)
      .delay(period)
      .save((error) => {
        if (error) {
          logger.error(`Errors occurred during creating task ${type} with payload ${JSON.stringify(data)}`);
          return;
        }
        logger.info(`Task ${type} with payload ${JSON.stringify(data)} and delay of ${period} has been created`);
      });
  }
}

export default TaskScheduler;
