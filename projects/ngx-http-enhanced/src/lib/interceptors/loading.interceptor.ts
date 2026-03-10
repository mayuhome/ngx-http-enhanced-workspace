import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { defaultLoadingStrategy } from '../core/strategies/loading.strategy';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });

  const strategy = {
    ...defaultLoadingStrategy,
    ...(config?.loadingStrategy || {})
  };

  const shouldShowLoading = strategy.showLoading?.(req) ?? false;

  if (!shouldShowLoading) {
    return next(req);
  }

  strategy.onStart?.();

  return next(req).pipe(
    finalize(() => {
      strategy.onEnd?.();
    })
  );
};
