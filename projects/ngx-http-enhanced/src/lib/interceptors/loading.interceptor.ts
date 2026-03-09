import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { defaultLoadingStrategy } from '../core/strategies/loading.strategy';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. safe inject dependencies
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const injector = inject(EnvironmentInjector);

  const strategy = {
    ...defaultLoadingStrategy,
    ...(config?.loadingStrategy || {})
  };

  const shouldShowLoading = strategy.showLoading?.(req) ?? false;

  if (!shouldShowLoading) {
    return next(req);
  }

  // 2. execute start callback (manually maintain injection context)
  runInInjectionContext(injector, () => {
    strategy.onStart?.();
  });

  return next(req).pipe(
    finalize(() => {
      // 3. execute end callback (manually maintain injection context in async pipeline)
      runInInjectionContext(injector, () => {
        strategy.onEnd?.();
      });
    })
  );
};
