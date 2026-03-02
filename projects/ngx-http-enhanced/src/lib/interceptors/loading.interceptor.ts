import { Inject, Injectable, Optional } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { HttpEnhancedConfig } from '../core/config.interface';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { defaultLoadingStrategy } from '../core/strategies/loading.strategy';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private strategy: HttpEnhancedConfig['loadingStrategy'];
  constructor( @Optional() @Inject(HTTP_ENHANCED_CONFIG) private config?: HttpEnhancedConfig) {
    this.strategy = { ...defaultLoadingStrategy, ...(config?.loadingStrategy || {}) };
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const shouldShowLoading = this.strategy?.showLoading?.(req) ?? false;
    if (!shouldShowLoading) {
      return next.handle(req);
    }

    this.strategy?.onStart(); // Pluggable: determine whether to show loading based on config.strategy

    return next.handle(req).pipe(
      finalize(() => {
          this.strategy?.onEnd();
      })
    );
  }
}
