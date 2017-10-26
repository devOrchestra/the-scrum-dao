import { TestBed, inject } from '@angular/core/testing';

import { WorkersResolverService } from './workers-resolver.service';

describe('WorkersResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkersResolverService]
    });
  });

  it('should be created', inject([WorkersResolverService], (service: WorkersResolverService) => {
    expect(service).toBeTruthy();
  }));
});
