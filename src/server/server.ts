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
    expressServer.set('scheduler', scheduler);
    expressServer.set('jira', new JiraConnector());
    expressServer.set('config', config);
    let port: number = config.port;
    let server: http.Server = http.createServer(expressServer);
    server.listen(port, function () {
      logger.info("Express server listening on port " + port);
    });

    // RUN TASK HANDLER
    cluster.fork();
    cluster.on('exit', function(worker, code, signal) {
      logger.error(`Tasks handler died with code ${code}`);
      if (code === 1) {
        logger.error(`Restarting in ${config.handler.restartTime} s`);
        setTimeout(() => cluster.fork(), config.handler.restartTime * 1000);
      }
    });
  });

} else {
  /**
   * STARTS BACKGROUND ETHEREUM TASKS HANDLER
   */
  loadConfig(path.resolve(__dirname, 'config.ini'), (error, config) => {
    if (error) {
      logger.error(`Errors occurred during loading config file: ${error.message}`);
      process.exit(1);
    }

    new TaskHandler(config)
      .init((error) => {
        if (!error) return;
        logger.error(`Errors occurred during task handler initialization: ${error.message}`);
        process.exit(1);
      });
  });
}


