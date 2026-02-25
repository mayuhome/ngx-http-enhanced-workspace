import { HttpRequest } from '@angular/common/http';

export const defaultCacheStrategy = {
  ttl: 300000,  // 5 分钟
  generateKey: (req: HttpRequest<any>) => req.urlWithParams,
  shouldCache: (req: HttpRequest<any>) => req.method === 'GET',
  evict: (key: string) => { /* 默认无操作，用户可覆盖为 LRU 等 */ }
};
