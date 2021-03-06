import express = require('express');
import morganLogger = require('morgan');
import bodyParser = require('body-parser');
import path = require('path');
import fs = require('fs');

import issueRouter from './issues';
import contributorRouter from './contributors';
import webhooksRouter from './webhooks';
import infoRouter from './info';
import createLogger from '../logger';
let logger = createLogger('express');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morganLogger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
let webAppPath: string = path.resolve('./', 'build/client');
app.use(express.static(webAppPath));
let artifactsPath: string = path.resolve('./', 'build/contracts');
app.use('/static/artifacts/', express.static(artifactsPath));
app.use('/static/chatbro-id.json', (req, res) => {
  let filePath = path.resolve('./', 'credentials/chatbro-id.json');
  fs.access(filePath, (error) => {
    if (error) return res.sendStatus(404);
    res.sendFile(filePath);
  });
});

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
app.use('/api/info', infoRouter);

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
