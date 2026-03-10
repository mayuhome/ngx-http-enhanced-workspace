import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';
import { defaultRetryStrategy } from '../core/strategies/retry.strategy';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });

  const strategy = {
    ...defaultRetryStrategy,
    ...(config?.retryStrategy || {})
  };

  return next(req).pipe(
    retry({
      count: strategy.maxRetries,
      delay: (error, retryCount) => {
        const shouldRetry = strategy.shouldRetry?.(error) ?? true;

        if (!shouldRetry) {
          throw error;
        }

        const delayTime = strategy.delay?.(retryCount) ?? 1000;

        return timer(delayTime);
      }
    })
  );
};
