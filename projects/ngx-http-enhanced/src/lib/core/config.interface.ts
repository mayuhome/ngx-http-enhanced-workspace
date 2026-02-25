import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpEnhancedConfig {
  loadingStrategy?: {
    showLoading: (req: HttpRequest<any>) => boolean;
    onStart: () => void;
    onEnd: () => void;
  },

  errorStrategy?: {
    handleError: (err: HttpErrorResponse) => Observable<never> | void;
  },

// 缓存策略：TTL、key 生成、淘汰机制
  cacheStrategy?: {
    ttl: number;                                     // 默认 TTL（ms），0 表示不缓存
    generateKey: (req: HttpRequest<any>) => string;  // 自定义缓存 key（默认：urlWithParams）
    shouldCache: (req: HttpRequest<any>) => boolean; // 是否缓存这个请求（默认：GET 方法）
    evict: (key: string) => void;                    // 自定义淘汰逻辑（e.g., LRU）
  };

  // 去重策略：决定如何判断请求相同
  deduplicateStrategy?: {
    generateKey: (req: HttpRequest<any>) => string;  // 自定义去重 key（默认：urlWithParams + method）
  };

  // 重试策略：次数、延迟、条件
  retryStrategy?: {
    maxRetries: number;                              // 最大重试次数（默认：3）
    delay: (attempt: number) => number;              // 延迟 ms（默认：指数退避 1000 * 2^{attempt}）
    shouldRetry: (err: HttpErrorResponse) => boolean;// 是否重试这个错误（默认：status 5xx 或 0）
  };

  // 全局插件：允许用户注入自定义拦截器或 RxJS operators
  plugins?: Array<(req: HttpRequest<any>, next: HttpHandler) => Observable<HttpEvent<any>>>;  // 自定义插件链
}
