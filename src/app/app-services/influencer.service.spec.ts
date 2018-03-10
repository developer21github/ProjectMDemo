import { TestBed, inject } from '@angular/core/testing';

import { InfluencerService } from './influencer.service';

describe('InfluencerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InfluencerService]
    });
  });

  it('should be created', inject([InfluencerService], (service: InfluencerService) => {
    expect(service).toBeTruthy();
  }));
});
