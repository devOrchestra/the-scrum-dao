import { TestBed, inject } from '@angular/core/testing';

import { OrdersResolverService } from './orders-resolver.service';

describe('OrdersResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdersResolverService]
    });
  });

  it('should be created', inject([OrdersResolverService], (service: OrdersResolverService) => {
    expect(service).toBeTruthy();
  }));
});
