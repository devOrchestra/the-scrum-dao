import express = require('express');

import logger from '../logger';
import TaskScheduler from "../taskScheduler";

const webhooksRouter: express.Router = express.Router();

webhooksRouter.post(`/:projectKey/:issueKey/created`, (req, res, next) => {
  const scheduler: TaskScheduler = req.app.get('scheduler');
  const {projectKey, issueKey}: {projectKey: string, issueKey: string} = req.params;
  logger.debug(`Received webhook from jira: issue ${issueKey} created`);
  res.sendStatus(200);
  scheduler.createTask('issue.created', {projectKey, issueKey}, 0, ()=>{});
});

export default webhooksRouter;
