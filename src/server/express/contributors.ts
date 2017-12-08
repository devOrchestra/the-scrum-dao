import express = require('express');
import {waterfall} from 'async';

import logger from '../logger';
import JiraConnector from '../jira';

const contributorRouter: express.Router = express.Router();


contributorRouter.get('/', (req, res, next) => {
  const jira: JiraConnector = req.app.get('jira');
  const config = req.app.get('config');
  const JIRA_URL = config.jiraUrl;
  const PROJECT_KEY = config.projectKey;

  logger.debug(`retrieving list of developers from jira project`);
  waterfall([
    (projectInfoReceived) => {
      jira.makeRequest({url: `https://${JIRA_URL}/rest/api/2/project/${PROJECT_KEY}`}, (error, body) => {
        if (error) return projectInfoReceived(error);
        if (!body || !body.roles || !body.roles.Developers) return projectInfoReceived(new Error('fail during retrieving project info'));
        projectInfoReceived(null, body.roles.Developers);
      });
    },

    (apiUrl, developersListReceived) => {
      jira.makeRequest({url: apiUrl}, (error, body) => {
        if (error) return developersListReceived(error);
        if (!body || !body.actors) return developersListReceived(new Error('fail during retrieving project developers'));
        developersListReceived(null, body.actors);
      });
    }

  ], (error, contributors) => {
    if (error) return next(error);
    res.json(contributors);
  });

});

export default contributorRouter;
