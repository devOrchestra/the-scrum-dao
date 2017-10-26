import express = require('express');

import logger from '../logger';
import JiraConnector from '../jira';

const issueRouter = express.Router();


issueRouter.get('/:issueName', (req, res, next) => {
  const {issueName} = req.params;
  const jira: JiraConnector = req.app.get('jira');

  logger.debug(`retrieving issue ${issueName} from jira project`);
  jira.makeRequest({url: `https://legalcoins.atlassian.net/rest/api/2/issue/${issueName}`}, (error, body) => {
    if (error) return next(error);
    res.json({id: body.id, key: body.key});
  });
});

export default issueRouter;
