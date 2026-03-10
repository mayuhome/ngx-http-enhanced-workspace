import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { getHttpEnhancedInterceptors, provideHttpEnhanced } from 'ngx-http-enhanced';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([...getHttpEnhancedInterceptors()])),
    // 只需一个 provideHttpEnhanced，自动配置 HttpClient 和所有拦截器
    provideHttpEnhanced({
      loadingStrategy: {
        showLoading: (req) => req.url.includes('jsonplaceholder'),
        onStart: () => console.log('[Loading] 开始加载'),
        onEnd: () => console.log('[Loading] 加载结束')
      },
      errorStrategy: {
        handleError: (err) => {
          console.error('[Error] 错误处理:', err);
          throw err;
        }
      },
      cacheStrategy: {
        ttl: 10000,
        generateKey: (req) => req.urlWithParams,
        shouldCache: (req) => req.method === 'GET',
        evict: (key) => console.log('[Cache] 缓存淘汰:', key)
      },
      deduplicateStrategy: {
        generateKey: (req) => req.urlWithParams + req.method
      },
      retryStrategy: {
        maxRetries: 3,
        delay: (attempt) => 1000 * Math.pow(2, attempt),
        shouldRetry: (err) => err.status >= 500 || err.status === 0
      }
    })
  ]
};
