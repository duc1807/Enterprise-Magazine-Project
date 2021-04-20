import { TestBed } from '@angular/core/testing';

import { PostedService } from './posted.service';

describe('PostedService', () => {
  let service: PostedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
