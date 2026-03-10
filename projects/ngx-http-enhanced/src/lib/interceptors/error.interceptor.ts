import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';
import { defaultErrorStrategy } from '../core/strategies/error.strategy';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const config = inject(HTTP_ENHANCED_CONFIG, { optional: true });

  const strategy = {
    ...defaultErrorStrategy,
    ...(config?.errorStrategy || {})
  };

  return next(req).pipe(
    catchError((err) => {
      strategy.handleError?.(err);
      return throwError(() => err);
    })
  );
};
