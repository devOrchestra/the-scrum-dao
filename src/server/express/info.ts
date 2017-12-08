import express = require('express');

import createLogger from '../logger';
let logger = createLogger('express');

const infoRouter: express.Router = express.Router();


infoRouter.get('/', (req, res, next) => {
  const config = req.app.get('config');
  const JIRA_URL = config.jiraUrl;
  const PROJECT_KEY = config.projectKey;

  logger.debug(`retrieving app info`);
  let info = {
    project: `https://${JIRA_URL}/projects/${PROJECT_KEY}`
  };
  res.json(info);
});

export default infoRouter;
