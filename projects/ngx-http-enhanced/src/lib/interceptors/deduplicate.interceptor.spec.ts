import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { deduplicateInterceptor } from './deduplicate.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

describe('DeduplicateInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = '/api/data';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            deduplicateStrategy: {
              generateKey: (req: any) => req.urlWithParams + req.method
            }
          }
        },
        provideHttpClient(withInterceptors([deduplicateInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // 确保没有遗留请求
    httpMock.verify();
  });

  it('应该合并并去重相同的并发请求', () => {
    const results: any[] = [];

    // 1. 同时发起三个相同的请求
    httpClient.get(TEST_URL).subscribe(res => results.push(res));
    httpClient.get(TEST_URL).subscribe(res => results.push(res));
    httpClient.get(TEST_URL).subscribe(res => results.push(res));

    // 2. 验证 httpMock 逻辑：虽然发起了 3 次，但底层应该只拦截到 1 个请求
    const req = httpMock.expectOne(TEST_URL);

    // 3. 返回一次结果
    const mockData = { id: 1, name: 'Test' };
    req.flush(mockData);

    // 4. 验证所有订阅者是否都收到了相同的数据
    expect(results.length).toBe(3);
    expect(results[0]).toEqual(mockData);
    expect(results[1]).toEqual(mockData);
    expect(results[2]).toEqual(mockData);
  });

  it('请求完成后，应当从 pending 池中移除，允许后续再次请求', () => {
    // 1. 发起第一次请求并结束
    httpClient.get(TEST_URL).subscribe();
    httpMock.expectOne(TEST_URL).flush({ data: 'first' });

    // 2. 发起第二次请求
    httpClient.get(TEST_URL).subscribe();

    // 如果没有被移除，expectOne 会报错（因为会复用之前的流，而不会有新请求）
    // 能够 expectOne 成功说明 finalize 已经清理了 key
    const req2 = httpMock.expectOne(TEST_URL);
    req2.flush({ data: 'second' });

    expect(req2.request.url).toBe(TEST_URL);
  });

  it('不同的请求（URL或方法不同）不应被合并', () => {
    httpClient.get(TEST_URL).subscribe();
    httpClient.post(TEST_URL, {}).subscribe();

    // 验证确实发起了两个不同的物理请求
    const reqs = httpMock.match(TEST_URL);
    expect(reqs.length).toBe(2);
    expect(reqs[0].request.method).toBe('GET');
    expect(reqs[1].request.method).toBe('POST');

    reqs[0].flush({});
    reqs[1].flush({});
  });

  it('当请求发生错误时，也应当清理 pending 池', () => {
    // 1. 发起失败的请求
    httpClient.get(TEST_URL).subscribe({ error: () => {} });
    httpMock.expectOne(TEST_URL).flush('Error', { status: 500, statusText: 'Server Error' });

    // 2. 再次发起相同请求，验证是否能重新发起（而非返回之前的错误流）
    httpClient.get(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req).toBeDefined();
    req.flush({ success: true });
  });
});
