import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpEnhancedConfig } from './config.interface';

export interface CacheEntry {
  value: HttpResponse<any>;
  expiry: number;
}

export const HTTP_ENHANCED_CONFIG = new InjectionToken<HttpEnhancedConfig>('HTTP_ENHANCED_CONFIG');

@Injectable()
export class HttpEnhancedService {
  readonly cache = new Map<string, CacheEntry>();
  readonly pending = new Map<string, Observable<any>>();

  constructor(
    @Optional()
    @Inject(HTTP_ENHANCED_CONFIG)
    private config?: HttpEnhancedConfig
  ) {}

  setCache(key: string, value: HttpResponse<any>, ttl: number): void {
    this.cache.set(key, {
      value: value.clone({
        body: this.safeClone(value.body)
      }),
      expiry: Date.now() + ttl
    });
  }

  getCache(key: string): HttpResponse<any> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value.clone({
      body: this.safeClone(entry.value.body)
    });
  }

  clearAll() {
    this.cache.clear();
    this.pending.clear();
  }

  private safeClone(body: any) {
    try {
      return structuredClone(body);
    } catch {
      return JSON.parse(JSON.stringify(body));
    }
  }
}
