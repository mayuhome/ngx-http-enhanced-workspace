import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CacheInterceptor } from './cache.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { HttpRequest } from '@angular/common/http';

describe('CacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: CacheInterceptor,
          multi: true
        },
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            cacheStrategy: {
              ttl: 60000,
              generateKey: (req: HttpRequest<any>) => req.urlWithParams,
              shouldCache: (req: HttpRequest<any>) => req.method === 'GET',
              evict: (key: string) => {}
            }
          }
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should cache GET requests', (done) => {
    const testData = { id: 1, name: 'Test' };

    http.get<any>('https://api.test.com/data').subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    expect(req.request.method).toBe('GET');
    req.flush(testData);

    http.get<any>('https://api.test.com/data').subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });

    httpMock.expectNone('https://api.test.com/data');
  });

  it('should not cache non-GET requests', (done) => {
    const testData = { id: 1, name: 'Test' };

    http.post<any>('https://api.test.com/data', testData).subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    expect(req.request.method).toBe('POST');
    req.flush(testData);

    http.post<any>('https://api.test.com/data', testData).subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });

    const req2 = httpMock.expectOne('https://api.test.com/data');
    expect(req2.request.method).toBe('POST');
    req2.flush(testData);
  });

  it('should respect custom shouldCache function', (done) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CacheInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: CacheInterceptor,
          multi: true
        },
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            cacheStrategy: {
              ttl: 60000,
              generateKey: (req: HttpRequest<any>) => req.urlWithParams,
              shouldCache: (req: HttpRequest<any>) => req.url.includes('cache'),
              evict: (key: string) => {}
            }
          }
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    const testData = { id: 1, name: 'Test' };

    http.get<any>('https://api.test.com/cache/data').subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('https://api.test.com/cache/data');
    req.flush(testData);

    http.get<any>('https://api.test.com/cache/data').subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });

    httpMock.expectNone('https://api.test.com/cache/data');
  });
});
