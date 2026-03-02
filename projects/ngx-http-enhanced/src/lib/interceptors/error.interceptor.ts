import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpEnhancedConfig } from '../core/config.interface';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { Observable, throwError } from 'rxjs';
import { defaultErrorStrategy } from '../core/strategies/error.strategy';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private strategy: HttpEnhancedConfig['errorStrategy'];
  constructor(
    @Optional() @Inject(HTTP_ENHANCED_CONFIG) private config?: HttpEnhancedConfig
  ) {
    this.strategy = { ...defaultErrorStrategy, ...(config?.errorStrategy || {}) };
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        this.strategy?.handleError?.(err);  // Pluggable: handle errors based on config.strategy
        return throwError(() => err);
      })
    );
  }
}
