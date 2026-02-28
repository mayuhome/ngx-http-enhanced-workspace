import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { HttpEnhancedConfig } from '../core/config.interface';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { defaultCacheStrategy } from '../core/strategies/cache.strategy';

const cache = new Map<string, { value: HttpResponse<any>, expiry: number }>();

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private strategy: HttpEnhancedConfig['cacheStrategy'];
constructor(@Optional() @Inject(HTTP_ENHANCED_CONFIG) private config?: HttpEnhancedConfig) {
    this.strategy = { ...defaultCacheStrategy, ...(config?.cacheStrategy || {}) };
  }
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.strategy?.shouldCache(req)) return next.handle(req);

    const key = this.strategy.generateKey(req);
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return of(cached.value.clone());
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const expiry = Date.now() + (this.strategy?.ttl || 0);
          cache.set(key, { value: event, expiry });
        }
      }),
      shareReplay(1)
    );
  }
}
