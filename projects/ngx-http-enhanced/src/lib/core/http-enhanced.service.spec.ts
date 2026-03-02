import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { HttpEnhancedService, HTTP_ENHANCED_CONFIG } from './http-enhanced.service';

describe('HttpEnhancedService', () => {
  let service: HttpEnhancedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpEnhancedService,
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            baseUrl: 'https://api.test.com',
            timeout: 5000
          }
        }
      ]
    });

    service = TestBed.inject(HttpEnhancedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP methods', () => {
    const testData = { id: 1, name: 'Test' };

    it('should perform GET request', () => {
      service.get<any>('https://api.test.com/data').subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('https://api.test.com/data');
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });

    it('should perform POST request', () => {
      const body = { name: 'New Item' };
      service.post<any>('https://api.test.com/data', body).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('https://api.test.com/data');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(testData);
    });

    it('should perform PUT request', () => {
      const body = { id: 1, name: 'Updated Item' };
      service.put<any>('https://api.test.com/data/1', body).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('https://api.test.com/data/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(testData);
    });

    it('should perform DELETE request', () => {
      service.delete<any>('https://api.test.com/data/1').subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('https://api.test.com/data/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(testData);
    });

    it('should perform PATCH request', () => {
      const body = { name: 'Patched Item' };
      service.patch<any>('https://api.test.com/data/1', body).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('https://api.test.com/data/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush(testData);
    });
  });

  describe('with config', () => {
    it('should work without config', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [HttpEnhancedService]
      });

      const serviceWithoutConfig = TestBed.inject(HttpEnhancedService);
      expect(serviceWithoutConfig).toBeTruthy();
    });
  });
});
