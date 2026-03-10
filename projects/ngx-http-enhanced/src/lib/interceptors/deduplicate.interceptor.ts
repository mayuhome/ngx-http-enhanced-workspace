import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { HTTP_ENHANCED_CONFIG, HttpEnhancedService } from '../core/http-enhanced.service';
import { defaultDeduplicateStrategy } from '../core/strategies/deduplicate.strategy';

export const deduplicateInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const service = inject(HttpEnhancedService);

  const strategy = {
    ...defaultDeduplicateStrategy,
    ...(config?.deduplicateStrategy || {})
  };
  const key = strategy.generateKey(req);

  // check if there is an active request with the same key
  const activeRequest = service.pending.get(key);
  if (activeRequest) {
    return activeRequest;
  }

  const shared = next(req).pipe(
    shareReplay(1),
    finalize(() => {
      service.pending.delete(key);
    })
  );

  service.pending.set(key, shared);
  return shared;
};
