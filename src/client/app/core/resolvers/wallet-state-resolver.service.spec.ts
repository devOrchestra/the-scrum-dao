import { TestBed, inject } from '@angular/core/testing';

import { WalletStateResolverService } from './wallet-state-resolver.service';

describe('WalletStateResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletStateResolverService]
    });
  });

  it('should be created', inject([WalletStateResolverService], (service: WalletStateResolverService) => {
    expect(service).toBeTruthy();
  }));
});
