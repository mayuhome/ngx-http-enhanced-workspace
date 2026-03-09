import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { HttpEnhancedConfig } from '../core/config.interface';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = '/data';

  // 模拟配置：重试 2 次，每次间隔 1s，仅在 500 错误时重试
  const mockConfig: HttpEnhancedConfig = {
    retryStrategy: {
      maxRetries: 2,
      delay: () => 1000,
      shouldRetry: (err) => err.status === 500
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_ENHANCED_CONFIG, useValue: mockConfig },
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    const mockResponse = { data: 'success' };

    httpClient.get('/data').subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/data');
    req.flush(mockResponse);
  });

  it('should retry specified number of times on 500 error', fakeAsync(() => {
    httpClient.get('/data').subscribe({ error: () => {} });

    // 初始失败
    httpMock.expectOne('/data').flush('', { status: 500, statusText: 'Error' });

    // 第一次重试
    tick(1000);
    httpMock.expectOne('/data').flush('', { status: 500, statusText: 'Error' });

    // 第二次重试
    tick(1000);
    httpMock.expectOne('/data').flush('', { status: 500, statusText: 'Error' });

    // 验证没有第三次
    tick(1000);
    httpMock.expectNone('/data');
  }));

  it('should stop retrying immediately if shouldRetry returns false', fakeAsync(() => {
    let errorCount = 0;

    httpClient.get('/data').subscribe({
      error: () => errorCount++
    });

    // 模拟 403 错误，不满足 shouldRetry (status === 500)
    const req = httpMock.expectOne('/data');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    tick(5000); // 等待较长时间确认没有重试发生

    expect(errorCount).toBe(1);
    httpMock.expectNone('/data'); // 确认后续没有新的请求发起
  }));

  it('should return success if a retry eventually succeeds', fakeAsync(() => {
    let result: any;
    httpClient.get('/data').subscribe((res) => (result = res));

    httpMock.expectOne('/data').flush('', { status: 500, statusText: 'Error' });

    tick(1000);
    httpMock.expectOne('/data').flush({ success: true });

    expect(result.success).toBe(true);
  }));

  it('should respect the dynamic delay timing', fakeAsync(() => {
    // 重新配置一个带有指数级延迟的策略
    const dynamicConfig: HttpEnhancedConfig = {
      retryStrategy: {
        maxRetries: 1,
        delay: (attempt) => attempt * 2000, // 指数级延迟
        shouldRetry: (err) => err.status === 500 // 仅在 500 错误时重试
      }
    };

    // 清理并重新配置测试模块以应用新配置
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_ENHANCED_CONFIG, useValue: dynamicConfig },
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting()
      ]
    });

    const client = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);

    client.get('/delay-test').subscribe({ error: () => {} });

    mock.expectOne('/delay-test').flush('', { status: 500, statusText: 'Error' });

    tick(1999);
    mock.expectNone('/delay-test'); // 还没到 2000ms，不应发起请求

    tick(1);
    mock.expectOne('/delay-test'); // 正好 2000ms，发起重试
  }));
});
