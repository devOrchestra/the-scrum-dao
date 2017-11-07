import express = require('express');

import logger from '../logger';
import JiraConnector from '../jira';

const webhooksRouter: express.Router = express.Router();


export default webhooksRouter;
