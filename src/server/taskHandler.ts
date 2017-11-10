import kue = require('kue');

import logger from './logger';

class TaskHandler {

  constructor(config) {
    this.config = config;
    this.handler = kue.createQueue(config.scheduler);
    logger.info('Task Handler is initialized');
  }

  // FIELDS
  private config: any;
  private handler: kue.Queue;

  // METHODS
}

export default TaskHandler;
