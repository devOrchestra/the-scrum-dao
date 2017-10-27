import { TestBed, inject } from '@angular/core/testing';

import { JiraService } from './jira.service';

describe('JiraService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JiraService]
    });
  });

  it('should be created', inject([JiraService], (service: JiraService) => {
    expect(service).toBeTruthy();
  }));
});
