import { Injectable, Inject, Optional } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retryWhen, delayWhen, take, mergeMap } from 'rxjs/operators';
import { timer, throwError, of } from 'rxjs';
import { HttpEnhancedConfig } from '../core/config.interface';
import { defaultRetryStrategy } from '../core/strategies/retry.strategy';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private strategy: HttpEnhancedConfig['retryStrategy'];

  constructor(@Optional() @Inject('HTTP_ENHANCED_CONFIG') private config?: HttpEnhancedConfig) {
    this.strategy = { ...defaultRetryStrategy, ...(config?.retryStrategy || {}) };
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((err, attempt) => {
          if (attempt > (this.strategy?.maxRetries || 0) || !this.strategy?.shouldRetry(err)) {
            return throwError(() => err);
          }
          return of(err);
        }),
        delayWhen((_, attempt) => timer(this.strategy?.delay?.(attempt) || 0)),
        take(this.strategy?.maxRetries || 0)
      ))
    );
  }
}
