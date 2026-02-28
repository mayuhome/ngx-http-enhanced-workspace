import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoadingInterceptor } from './loading.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { HttpRequest } from '@angular/common/http';

describe('LoadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let onStartSpy: jasmine.Spy;
  let onEndSpy: jasmine.Spy;

  beforeEach(() => {
    onStartSpy = jasmine.createSpy('onStart');
    onEndSpy = jasmine.createSpy('onEnd');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoadingInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: LoadingInterceptor,
          multi: true
        },
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            loadingStrategy: {
              showLoading: (req: HttpRequest<any>) => true,
              onStart: onStartSpy,
              onEnd: onEndSpy
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

  it('should call onStart and onEnd for requests', (done) => {
    const testData = { id: 1, name: 'Test' };

    http.get<any>('https://api.test.com/data').subscribe(data => {
      expect(data).toEqual(testData);
      expect(onStartSpy).toHaveBeenCalled();
      expect(onEndSpy).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush(testData);
  });

  it('should call onEnd even on error', (done) => {
    http.get<any>('https://api.test.com/data').subscribe({
      next: () => fail('should have failed'),
      error: () => {
        expect(onStartSpy).toHaveBeenCalled();
        expect(onEndSpy).toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush('Test error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should respect custom showLoading function', (done) => {
    TestBed.resetTestingModule();

    const onStartSpy2 = jasmine.createSpy('onStart');
    const onEndSpy2 = jasmine.createSpy('onEnd');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoadingInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: LoadingInterceptor,
          multi: true
        },
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            loadingStrategy: {
              showLoading: (req: HttpRequest<any>) => req.url.includes('show'),
              onStart: onStartSpy2,
              onEnd: onEndSpy2
            }
          }
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    const testData = { id: 1, name: 'Test' };

    http.get<any>('https://api.test.com/noshow/data').subscribe(data => {
      expect(data).toEqual(testData);
      expect(onStartSpy2).not.toHaveBeenCalled();
      expect(onEndSpy2).not.toHaveBeenCalled();
    });

    const req = httpMock.expectOne('https://api.test.com/noshow/data');
    req.flush(testData);

    http.get<any>('https://api.test.com/show/data').subscribe(data => {
      expect(data).toEqual(testData);
      expect(onStartSpy2).toHaveBeenCalled();
      expect(onEndSpy2).toHaveBeenCalled();
      done();
    });

    const req2 = httpMock.expectOne('https://api.test.com/show/data');
    req2.flush(testData);
  });
});
