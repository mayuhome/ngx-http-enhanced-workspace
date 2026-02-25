import { HttpRequest } from '@angular/common/http';

export const defaultDeduplicateStrategy = {
  generateKey: (req: HttpRequest<any>) => req.urlWithParams + req.method
};
