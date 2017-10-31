import express = require('express');

import logger from '../logger';
import JiraConnector from '../jira';

const issueRouter: express.Router = express.Router();
const PROJECT_KEY: string = 'SD';


issueRouter.get('/', (req, res, next) => {
  const jira: JiraConnector = req.app.get('jira');

  logger.debug(`retrieving backlog issues from jira project`);
  jira.makeRequest({url: `https://legalcoins.atlassian.net/rest/api/2/search?jql=project="${PROJECT_KEY}" AND status="Backlog"&fields=id,key,status,assignee,summary,issuetype`},
    (error, body) => {
    if (error) return next(error);
    if (!body || !body.issues) return next('fail during retrieving project issues');
    res.json(body.issues);
  });
});


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
