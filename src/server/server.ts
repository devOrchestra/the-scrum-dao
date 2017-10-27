import http = require('http');

import logger from './logger';
import expressServer from './express';
import JiraConnector from './jira';


/**
 * INITIALIZING JIRA API CONNECTOR
 */
expressServer.set('jira', new JiraConnector());

/**
 * STARTING HTTP SERVER
 */
let port: number = process.env.SERVER_PORT || 8021;
let server: http.Server = http.createServer(expressServer);
server.listen(port, function () {
  logger.info("Express server listening on port " + port);
});
