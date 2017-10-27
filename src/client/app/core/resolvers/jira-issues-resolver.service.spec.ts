import { TestBed, inject } from '@angular/core/testing';

import { JiraIssuesResolverService } from './jira-issues-resolver.service';

describe('JiraIssuesResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraIssuesResolverService]
    });
  });

  it('should be created', inject([JiraIssuesResolverService], (service: JiraIssuesResolverService) => {
    expect(service).toBeTruthy();
  }));
});
