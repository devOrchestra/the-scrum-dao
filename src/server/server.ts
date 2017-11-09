import http = require('http');
import loadConfig = require('ini-config');
import path = require('path');

import logger from './logger';
import expressServer from './express';
import JiraConnector from './jira';
import TaskScheduler from './taskScheduler';

loadConfig(path.resolve(__dirname, 'config.ini'), (error, config) => {
  if (error) throw error;
  
  let scheduler = new TaskScheduler(config);
  
  /**
   * STARTING HTTP SERVER
   */
  expressServer.set('scheduler', scheduler);
  expressServer.set('jira', new JiraConnector());
  expressServer.set('config', config);
  let port: number = config.port;
  let server: http.Server = http.createServer(expressServer);
  server.listen(port, function () {
    logger.info("Express server listening on port " + port);
  });
});

