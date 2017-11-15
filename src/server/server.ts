import http = require('http');
import loadConfig = require('ini-config');
import path = require('path');
import cluster = require('cluster');

import logger from './logger';
import expressServer from './express';
import JiraConnector from './jira';
import TaskScheduler from './taskScheduler';
import TaskHandler from "./taskHandler";

if (cluster.isMaster) {
  /**
   * STARTS MAIN SERVER
   */
  loadConfig(path.resolve(__dirname, 'config.ini'), (error, config) => {
    if (error) throw error;

    let scheduler = new TaskScheduler(config);
    let tasksHandler = cluster.fork();
    tasksHandler.on('exit', (code, signal) => {
      logger.info(`Tasks handler died with code ${code}`);
    });

    expressServer.set('scheduler', scheduler);
    expressServer.set('jira', new JiraConnector());
    expressServer.set('config', config);
    let port: number = config.port;
    let server: http.Server = http.createServer(expressServer);
    server.listen(port, function () {
      logger.info("Express server listening on port " + port);
    });
  });

} else {
  /**
   * STARTS BACKGROUND ETHEREUM TASKS HANDLER
   */
  loadConfig(path.resolve(__dirname, 'config.ini'), (error, config) => {
    if (error) throw error;

    new TaskHandler(config)
      .init((error)=>{
        if (error) throw error;
      });
  });
}


