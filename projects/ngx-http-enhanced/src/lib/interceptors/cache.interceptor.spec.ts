import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { cacheInterceptor } from './cache.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

describe('CacheInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = '/api/resource';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            cacheStrategy: {
              shouldCache: (req: any) => req.method === 'GET',
              ttl: 3000,
              generateKey: (req: any) => req.urlWithParams
            }
          }
        },
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('第一次请求应该发起网络调用，并缓存结果', () => {
    const mockData = { id: 1, text: 'Hello' };

    httpClient.get(TEST_URL).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    // 第一次必须有网络请求
    const req = httpMock.expectOne(TEST_URL);
    req.flush(mockData);
  });

  it('在 TTL 时间内发起第二次请求，应该直接返回缓存，不发起网络调用', fakeAsync(() => {
    const mockData = { id: 1 };

    // 1. 发起第一次请求并缓存
    httpClient.get(TEST_URL).subscribe();
    httpMock.expectOne(TEST_URL).flush(mockData);

    // 2. 模拟时间流逝 2 秒 (未过期)
    tick(2000);

    // 3. 发起第二次请求
    let cachedResult: any;
    httpClient.get(TEST_URL).subscribe((res) => (cachedResult = res));
    tick();

    // 验证：httpMock 应该找不到新请求 (expectNone)
    httpMock.expectNone(TEST_URL);
    expect(cachedResult).toEqual(mockData);
  }));

  it('当缓存过期后，应该再次发起网络请求', fakeAsync(() => {
    // 1. 缓存数据
    httpClient.get(TEST_URL).subscribe();
    httpMock.expectOne(TEST_URL).flush({ data: 'old' });

    // 2. 模拟时间流逝 6 秒 (超过 TTL 5s)
    tick(6000);

    // 3. 再次发起请求
    httpClient.get(TEST_URL).subscribe();

    // 验证：此时应该产生了一个新的网络请求
    httpMock.expectOne(TEST_URL);
  }));

  it('返回的响应应该是克隆对象，防止状态污染', fakeAsync(() => {
    const originalBody = { user: { name: 'Old' } };
    let firstResponse: any;
    let secondResponse: any;

    httpClient.get(TEST_URL).subscribe((res) => (firstResponse = res));
    httpMock.expectOne(TEST_URL).flush(originalBody);

    tick(1000);

    httpClient.get(TEST_URL).subscribe((res) => (secondResponse = res));
    tick(1000);

    // 验证没有新的网络请求
    httpMock.expectNone(TEST_URL);

    // 修改第一个响应的对象属性
    firstResponse.user.name = 'Modified';

    // 验证第二个响应（从缓存获取）没有受到影响
    expect(secondResponse.user.name).toBe('Old');
    expect(firstResponse).not.toBe(secondResponse); // 引用地址应不同
  }));

  it('非 GET 请求不应触发缓存逻辑 (根据 shouldCache 配置)', () => {
    httpClient.post(TEST_URL, {}).subscribe();

    // 即使发了两次 POST
    httpMock.expectOne(TEST_URL).flush({});

    httpClient.post(TEST_URL, {}).subscribe();
    // 依然会有第二次请求
    httpMock.expectOne(TEST_URL).flush({});
  });
});
