import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

const defaultErrorHandler = (err: HttpErrorResponse) => {
  console.error('HTTP Error:', err);
  alert(`Error: ${err.message}`);  // 默认 alert，用户可覆盖为 toast
  return throwError(() => err);
};

export const defaultErrorStrategy = {
  handleError: defaultErrorHandler
};
