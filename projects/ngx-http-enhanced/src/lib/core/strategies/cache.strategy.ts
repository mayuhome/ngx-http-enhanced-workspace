import { HttpRequest } from '@angular/common/http';

export const defaultCacheStrategy = {
  ttl: 300000,  // 5 minutes
  generateKey: (req: HttpRequest<any>) => req.urlWithParams,
  shouldCache: (req: HttpRequest<any>) => req.method === 'GET',
  evict: (key: string) => { /* Default no-op, users can override with LRU, etc. */ }
};
