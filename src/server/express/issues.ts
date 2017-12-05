import express = require('express');

import logger from '../logger';
import JiraConnector from '../jira';

const issueRouter: express.Router = express.Router();
let PROJECT_KEY: string;


issueRouter.get('/', (req, res, next) => {
  if (!PROJECT_KEY) {
    const config = req.app.get('config');
    PROJECT_KEY = config.projectKey;
  }

  const jira: JiraConnector = req.app.get('jira');
  let {status} = req.query;
  let statusQuery: string;
  if (status) {
    statusQuery = `AND status="${status}"`;
  } else {
    statusQuery = `AND (status="Backlog" OR status="In Progress" OR status="Selected for Development")`
  }
  logger.debug(`retrieving backlog issues from jira project`);
  let url = `https://legalcoins.atlassian.net/rest/api/2/search?jql=project="${PROJECT_KEY}" ${statusQuery}&fields=id,key,status,assignee,summary,issuetype&maxResults=1000`;
  jira.makeRequest({url}, (error, body) => {
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
