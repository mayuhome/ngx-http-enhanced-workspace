import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = '/test-error';

  // 用于间接测试 handleError 是否被调用
  let spyHandleError: jasmine.Spy;

  beforeEach(() => {
    spyHandleError = jasmine.createSpy('handleError');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            errorStrategy: {
              handleError: spyHandleError
            }
          }
        },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('当请求成功时，不应调用 handleError', () => {
    httpClient.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ message: 'success' });

    expect(spyHandleError).not.toHaveBeenCalled();
  });

  it('当请求发生 HTTP 错误时，应调用 handleError 并传递错误对象', () => {
    let capturedError: any;

    httpClient.get(TEST_URL).subscribe({
      next: () => fail('应该发生错误'),
      error: (err) => capturedError = err
    });

    const mockError = { status: 404, statusText: 'Not Found' };
    const req = httpMock.expectOne(TEST_URL);
    req.flush('Error content', mockError);

    // 1. 验证策略回调被调用
    expect(spyHandleError).toHaveBeenCalledTimes(1);

    // 2. 验证传递给回调的是 HttpErrorResponse
    const errorInCallback = spyHandleError.calls.mostRecent().args[0];
    expect(errorInCallback instanceof HttpErrorResponse).toBe(true);
    expect(errorInCallback.status).toBe(404);

    // 3. 验证 RxJS 流依然抛出了错误
    expect(capturedError.status).toBe(404);
  });

  it('应在处理错误后，依然通过 throwError 抛出错误给后续订阅者', () => {
    let isErrorCaughtBySubscriber = false;

    httpClient.get(TEST_URL).subscribe({
      error: () => isErrorCaughtBySubscriber = true
    });

    httpMock.expectOne(TEST_URL).flush('Internal Error', { status: 500, statusText: 'Server Error' });

    expect(isErrorCaughtBySubscriber).toBe(true);
  });

  it('即使配置缺失，拦截器也应正常转发请求', () => {
    // 重新配置一个没有 config 的环境
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        // 不提供 HTTP_ENHANCED_CONFIG
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    const client = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);

    let errorThrown = false;
    client.get('/no-config').subscribe({ error: () => errorThrown = true });

    mock.expectOne('/no-config').flush('Fail', { status: 400, statusText: 'Bad Request' });

    expect(errorThrown).toBe(true);
  });
});
