import { TestBed, inject } from '@angular/core/testing';

import { CrowdsaleService } from './crowdsale.service';

describe('CrowdsaleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrowdsaleService]
    });
  });

  it('should be created', inject([CrowdsaleService], (service: CrowdsaleService) => {
    expect(service).toBeTruthy();
  }));
});
