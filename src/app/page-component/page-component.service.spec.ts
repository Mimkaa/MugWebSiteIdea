import { TestBed } from '@angular/core/testing';
import { PageComponentService } from './page-component.service';

describe('PageComponentService', () => {
  let service: PageComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
