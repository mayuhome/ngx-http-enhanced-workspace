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

// Cache strategy: TTL, key generation, eviction mechanism
  cacheStrategy?: {
    ttl: number;                                     // Default TTL (ms), 0 means no caching
    generateKey: (req: HttpRequest<any>) => string;  // Custom cache key (default: urlWithParams)
    shouldCache: (req: HttpRequest<any>) => boolean; // Whether to cache this request (default: GET method)
    evict: (key: string) => void;                    // Custom eviction logic (e.g., LRU)
  };

  // Deduplicate strategy: determine how to identify identical requests
  deduplicateStrategy?: {
    generateKey: (req: HttpRequest<any>) => string;  // Custom deduplication key (default: urlWithParams + method)
  };

  // Retry strategy: count, delay, condition
  retryStrategy?: {
    maxRetries: number;                              // Maximum retry count (default: 3)
    delay: (attempt: number) => number;              // Delay in ms (default: exponential backoff 1000 * 2^{attempt})
    shouldRetry: (err: HttpErrorResponse) => boolean;// Whether to retry this error (default: status 5xx or 0)
  };

  // Global plugins: allow users to inject custom interceptors or RxJS operators
  plugins?: Array<(req: HttpRequest<any>, next: HttpHandler) => Observable<HttpEvent<any>>>;  // Custom plugin chain
}
