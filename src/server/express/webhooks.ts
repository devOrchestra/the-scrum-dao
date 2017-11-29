import express = require('express');

import logger from '../logger';
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

  let changedData = items[0];
  if (changedData.fieldId !== 'status') return;

  if (changedData.fromString === 'Backlog' && (changedData.toString === 'Selected for Development' || changedData.toString === 'In Progress')) {
    return scheduler.createTask('issue.development.started', {issueKey, projectKey}, 0);
  }

  if ((changedData.fromString === 'Selected for Development' || changedData.fromString === 'In Progress') && changedData.toString === 'Done') {
    let assignee = webhookPayload.issue.fields.assignee.name;
    return scheduler.createTask('issue.development.finished', {issueKey, projectKey, assignee}, 0);
  }
}
