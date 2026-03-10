import { TestBed } from '@angular/core/testing';

import { EnhancedClientService } from './enhanced-client.service';

describe('EnhancedClientService', () => {
  let service: EnhancedClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnhancedClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
