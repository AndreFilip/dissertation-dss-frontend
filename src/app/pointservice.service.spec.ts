import { TestBed, inject } from '@angular/core/testing';

import { PointserviceService } from './pointservice.service';

describe('PointserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PointserviceService]
    });
  });

  it('should be created', inject([PointserviceService], (service: PointserviceService) => {
    expect(service).toBeTruthy();
  }));
});
