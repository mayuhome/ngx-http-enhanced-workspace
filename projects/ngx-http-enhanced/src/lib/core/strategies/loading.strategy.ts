import { HttpRequest } from '@angular/common/http';

export const defaultLoadingStrategy = {
  showLoading: (req: HttpRequest<any>) => false,  // Default: do not show loading for all requests
  onStart: () => { /* Inject loading service show */ },
  onEnd: () => { /* Inject loading service hide */ }
};
