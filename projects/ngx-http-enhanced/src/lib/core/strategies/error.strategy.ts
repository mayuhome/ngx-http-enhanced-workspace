import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

const defaultErrorHandler = (err: HttpErrorResponse) => {
  console.error('HTTP Error:', err);
  alert(`Error: ${err.message}`);  // Default alert, users can override with toast
  return throwError(() => err);
};

export const defaultErrorStrategy = {
  handleError: defaultErrorHandler
};
