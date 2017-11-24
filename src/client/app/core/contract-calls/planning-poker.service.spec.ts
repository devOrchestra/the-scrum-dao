import { TestBed, inject } from '@angular/core/testing';

import { PlanningPokerService } from './planning-poker.service';

describe('PlanningPokerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlanningPokerService]
    });
  });

  it('should be created', inject([PlanningPokerService], (service: PlanningPokerService) => {
    expect(service).toBeTruthy();
  }));
});
