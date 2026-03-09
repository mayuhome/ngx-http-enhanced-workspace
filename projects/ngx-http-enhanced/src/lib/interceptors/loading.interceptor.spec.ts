import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

describe('LoadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = '/test-loading';

  let spyOnStart: jasmine.Spy;
  let spyOnEnd: jasmine.Spy;

  beforeEach(() => {
    spyOnStart = jasmine.createSpy('onStart');
    spyOnEnd = jasmine.createSpy('onEnd');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            loadingStrategy: {
              // 模拟：所有请求都显示 loading
              showLoading: () => true,
              onStart: spyOnStart,
              onEnd: spyOnEnd
            }
          }
        },
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('应该在请求开始时调用 onStart，并在请求成功结束时调用 onEnd', fakeAsync(() => {
    httpClient.get(TEST_URL).subscribe();

    // 1. 请求发起，验证 onStart

    expect(spyOnStart).toHaveBeenCalled();
    httpMock.expectOne(TEST_URL).flush({});

    tick();

    expect(spyOnEnd).toHaveBeenCalled();
  }));

  it('当请求发生错误时，依然应该调用 onEnd (确保 loading 关闭)', fakeAsync(() => {
    httpClient.get(TEST_URL).subscribe({
      next: () => fail('应该失败'),
      error: () => {}
    });



    // 模拟 HTTP 错误
    const req = httpMock.expectOne(TEST_URL);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    tick();

    // finalize 保证了错误路径也会触发 onEnd
    expect(spyOnEnd).toHaveBeenCalled();
  }));

  it('当 showLoading 返回 false 时，不应触发任何回调', fakeAsync(() => {
    // 重新配置：该请求不显示 loading
    const reqWithNoLoading = '/no-loading';

    // 我们可以在测试中动态修改策略逻辑，或者利用不同的 URL 测试
    // 这里假设逻辑由 strategy.showLoading 控制
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            loadingStrategy: {
              showLoading: (req: any) => req.url.includes('show'),
              onStart: spyOnStart,
              onEnd: spyOnEnd
            }
          }
        },
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    const client = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);

    // 发起不满足条件的请求
    client.get('/hidden-request').subscribe();
    mock.expectOne('/hidden-request').flush({});

    expect(spyOnStart).not.toHaveBeenCalled();
    expect(spyOnEnd).not.toHaveBeenCalled();
  }));
});
