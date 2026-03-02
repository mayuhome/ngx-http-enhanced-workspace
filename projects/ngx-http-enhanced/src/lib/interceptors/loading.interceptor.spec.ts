import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptor,
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

  it('should call onStart and onEnd for requests', fakeAsync(() => {
    const testData = { id: 1, name: 'Test' };
    let responseReceived = false;

    http.get<any>('https://api.test.com/data').subscribe(data => {
      expect(data).toEqual(testData);
      responseReceived = true;
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush(testData);

    tick(); // 确保所有异步操作完成

    expect(responseReceived).toBeTrue();
    expect(onStartSpy).toHaveBeenCalled();
    expect(onEndSpy).toHaveBeenCalled();
  }));

  it('should call onEnd even on error', fakeAsync(() => {
    http.get<any>('https://api.test.com/data').subscribe({
      next: () => fail('should have failed'),
      error: () => {}
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush('Test error', { status: 500, statusText: 'Internal Server Error' });

    tick(); // 确保所有异步操作完成
    expect(onStartSpy).toHaveBeenCalled();
    expect(onEndSpy).toHaveBeenCalled();

  }));
});
