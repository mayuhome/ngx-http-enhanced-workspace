import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';
import { defaultRetryStrategy } from '../core/strategies/retry.strategy';
import { HTTP_ENHANCED_CONFIG } from '../../public-api';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const injector = inject(EnvironmentInjector);

  const strategy = {
    ...defaultRetryStrategy,
    ...(config?.retryStrategy || {})
  };

  return next(req).pipe(
    retry({
      count: strategy.maxRetries,
      delay: (error, retryCount) => {
        // 1. 检查是否应该继续重试
        const shouldRetry = runInInjectionContext(injector, () =>
          strategy.shouldRetry?.(error) ?? true
        );

        if (!shouldRetry) {
          throw error; // 停止重试，直接抛出错误
        }

        // 2. 计算延迟时间并等待
        const delayTime = runInInjectionContext(injector, () =>
          strategy.delay?.(retryCount) ?? 1000
        );

        console.log(`[Retry] 第 ${retryCount} 次重试，延迟 ${delayTime}ms`);
        return timer(delayTime);
      }
    })
  );
};
