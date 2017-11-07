import { TestBed, inject } from '@angular/core/testing';

import { Web3ResolverService } from './web3-resolver.service';

describe('Web3ResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3ResolverService]
    });
  });

  it('should be created', inject([Web3ResolverService], (service: Web3ResolverService) => {
    expect(service).toBeTruthy();
  }));
});
