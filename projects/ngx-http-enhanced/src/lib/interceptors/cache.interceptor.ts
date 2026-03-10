import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { defaultCacheStrategy } from '../core/strategies/cache.strategy';
import { HTTP_ENHANCED_CONFIG, HttpEnhancedService } from '../core/http-enhanced.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const service = inject(HttpEnhancedService);

  const strategy = {
    ...defaultCacheStrategy,
    ...(config?.cacheStrategy || {})
  };

  const shouldCache = strategy.shouldCache?.(req) ?? false;
  if (!shouldCache) return next(req);

  const key = strategy.generateKey?.(req) ?? req.urlWithParams;

  const cached = service.getCache(key);
  if (cached) {
    return new Observable<HttpEvent<any>>((subscriber) => {
      subscriber.next(cached);
      subscriber.complete();
    });
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const ttl = strategy.ttl ?? 0;
        service.setCache(key, event, ttl);
        strategy.evict?.(key);
      }
    })
  );
};
