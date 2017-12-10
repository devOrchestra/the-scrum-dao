import { TestBed, inject } from '@angular/core/testing';

import { ChatbroService } from './chatbro.service';

describe('ChatbroService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatbroService]
    });
  });

  it('should be created', inject([ChatbroService], (service: ChatbroService) => {
    expect(service).toBeTruthy();
  }));
});
