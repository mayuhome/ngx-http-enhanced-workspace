import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HTTP_ENHANCED_CONFIG } from '../../public-api';
import { defaultErrorStrategy } from '../core/strategies/error.strategy';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });
  const injector = inject(EnvironmentInjector);

  const strategy = {
    ...defaultErrorStrategy,
    ...(config?.errorStrategy || {})
  };

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // use `runInInjectionContext` to execute user-defined callback
      runInInjectionContext(injector, () => {
        strategy.handleError?.(err);
      });
      return throwError(() => err);
    })
  );
};
