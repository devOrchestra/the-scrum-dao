import request = require('request');
import path = require('path');
import fs = require('fs');


class JiraConnector {
  constructor() {
    let jiraCredentials: string = fs.readFileSync(path.resolve('./', 'credentials/jira-api.json')).toString('utf8');
    let jiraPrivateKey: string = fs.readFileSync(path.resolve('./', 'credentials/jira-api-private.pem')).toString('utf8');
    this.jiraOAuth = JSON.parse(jiraCredentials);
    this.jiraOAuth.private_key = jiraPrivateKey;
  }

  private jiraOAuth;

  public makeRequest(options: {url: string, method?: string, qs?: string, form?: any}, cb) {
    request({oauth: this.jiraOAuth, ...options}, (error, response, body) => {
      if (error) return cb(error);
      if (response && response.statusCode >= 400) {
        let error: any = new Error(JSON.stringify(body));
        error.status = response.statusCode;
        return cb(error);
      }
      cb(null, JSON.parse(body));
    });
  }
}

export default JiraConnector;

