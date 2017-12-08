import express = require('express');

import createLogger from '../logger';
let logger = createLogger('express');
import TaskScheduler from "../taskScheduler";

const webhooksRouter: express.Router = express.Router();

webhooksRouter.post(`/:projectKey/:issueKey`, (req, res, next) => {
  const scheduler: TaskScheduler = req.app.get('scheduler');
  const {projectKey, issueKey}: {projectKey: string, issueKey: string} = req.params;
  let {webhookEvent} = req.body;

  logger.debug(`Received webhook from jira: issue ${issueKey}, project ${projectKey}, event ${webhookEvent}`);
  if (webhookEvent === 'jira:issue_created') {
    scheduler.createTask('issue.created', {projectKey, issueKey}, 0);

  } else if (webhookEvent === 'jira:issue_updated') {
    createTaskFromUpdatedIssue(scheduler, issueKey, projectKey, req.body);
  }
  res.sendStatus(200);
});

export default webhooksRouter;

function createTaskFromUpdatedIssue(scheduler: TaskScheduler, issueKey: string, projectKey: string, webhookPayload): void {
  let webhookChangelog = webhookPayload.changelog;
  if (!webhookChangelog) return;

  let items = webhookChangelog.items;
  if (!items || items.length === 0) return;

  for (let changedData of items) {
    if (changedData.fieldId !== 'status') return;

    if (changedData.fromString === 'Backlog' && changedData.toString === 'In Progress') {
       scheduler.createTask('issue.development.started', {issueKey, projectKey}, 0);
       break;
    }

    if ((changedData.fromString === 'Done') && changedData.toString === 'Closed') {
      if (!webhookPayload.issue.fields.assignee) {
        logger.error(`Error in project ${webhookPayload.issue.fields.assignee} issue ${issueKey}: finished issue has no assignee`);
        break;
      }
      let assignee = webhookPayload.issue.fields.assignee.name;
      scheduler.createTask('issue.development.finished', {issueKey, projectKey, assignee}, 0);
      break;
    }

  }
}
