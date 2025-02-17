import { TestBed } from '@angular/core/testing';

import { DeveloperModeService } from './developer-mode.service';

describe('DeveloperModeService', () => {
  let service: DeveloperModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeveloperModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
