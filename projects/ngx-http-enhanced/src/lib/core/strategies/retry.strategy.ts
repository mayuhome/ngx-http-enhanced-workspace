import { HttpErrorResponse } from '@angular/common/http';

export const defaultRetryStrategy = {
  maxRetries: 3,
  delay: (attempt: number) => 1000 * Math.pow(2, attempt),  // Exponential backoff
  shouldRetry: (err: HttpErrorResponse) => err.status === 0 || (err.status >= 500 && err.status < 600)
};
