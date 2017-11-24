import express = require('express');
import morganLogger = require('morgan');
import bodyParser = require('body-parser');
import path = require('path');

import issueRouter from './issues';
import contributorRouter from './contributors';
import webhooksRouter from './webhooks';
import logger from '../logger';

const app = express();
let webAppPath: string = path.resolve('./', 'build/client');
if (process.env.NODE_ENV === 'development') {
  app.use(morganLogger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(webAppPath));

/**
 * Routes configure
 */

app.get('/api/ping', (req, res)=> {
  logger.debug("ping");
  res.json("pong");
});

app.use('/api/issues', issueRouter);
app.use('/api/contributors', contributorRouter);
app.use('/api/webhooks', webhooksRouter);

app.use('/*', express.static(path.resolve(webAppPath, 'index.html')));

app.use(function (req: express.Request, res: express.Response, next) {
  logger.debug(`${req.path} not found`);
  res.status(404).send("Not found")
});

app.use(function (error: Error, req: express.Request, res: express.Response, next) {
  logger.error(error.message);
  res.status(500).send('internal error');
});

export default app;
