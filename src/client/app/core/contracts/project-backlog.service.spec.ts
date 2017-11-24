import { TestBed, inject } from '@angular/core/testing';

import { ProjectBacklogService } from './project-backlog.service';

describe('ProjectBacklogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectBacklogService]
    });
  });

  it('should be created', inject([ProjectBacklogService], (service: ProjectBacklogService) => {
    expect(service).toBeTruthy();
  }));
});
