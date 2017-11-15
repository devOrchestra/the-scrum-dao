import { TestBed, inject } from '@angular/core/testing';

import { WalletStateService } from './wallet-state.service';

describe('WalletStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletStateService]
    });
  });

  it('should be created', inject([WalletStateService], (service: WalletStateService) => {
    expect(service).toBeTruthy();
  }));
});
