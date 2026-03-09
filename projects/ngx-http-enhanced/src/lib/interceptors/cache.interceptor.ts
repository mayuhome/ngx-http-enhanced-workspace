import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap, shareReplay } from 'rxjs';
import { defaultCacheStrategy } from '../core/strategies/cache.strategy';
import { HTTP_ENHANCED_CONFIG, HttpEnhancedService } from '../core/http-enhanced.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const injector = inject(EnvironmentInjector);
  const service = inject(HttpEnhancedService);

  const strategy = {
    ...defaultCacheStrategy,
    ...(config?.cacheStrategy || {})
  };

  const shouldCache = runInInjectionContext(injector, () => strategy.shouldCache?.(req) ?? false);
  if (!shouldCache) return next(req);

  if (!shouldCache) {
    return next(req);
  }

  const key = runInInjectionContext(injector, () => strategy.generateKey?.(req) ?? req.urlWithParams);

  const cached = service.getCache(key);
  if (cached) {
    return of(cached);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const ttl = strategy.ttl ?? 0;
        service.setCache(key, event, ttl);

        runInInjectionContext(injector, () => strategy.evict?.(key));
      }
    }),
    shareReplay(1)
  );
};
