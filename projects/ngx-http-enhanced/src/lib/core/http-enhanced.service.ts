import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpEnhancedConfig } from './config.interface';

export interface CacheEntry {
  value: HttpResponse<any>;
  expiry: number;
}

export const HTTP_ENHANCED_CONFIG =
  new InjectionToken<HttpEnhancedConfig>('HTTP_ENHANCED_CONFIG');

@Injectable({ providedIn: 'root' })
export class HttpEnhancedService<T = any> {
  readonly cache = new Map<string, CacheEntry>();
  readonly pending = new Map<string, Observable<any>>();

  constructor(
    private http: HttpClient,
    @Optional() @Inject(HTTP_ENHANCED_CONFIG)
    private config?: HttpEnhancedConfig
  ) { }

  get<R = T>(url: string, options: {
  observe?: 'body';   // Only allow 'body' or undefined
  [key: string]: any;
} = {}): Observable<R> {  // Generic response
    return this.http.get<R>(url, options);
  }

  post<R = T>(url: string, body?: any, options: {
  observe?: 'body';   // Only allow 'body' or undefined
  [key: string]: any;
} = {}): Observable<R> {
    return this.http.post<R>(url, body, options);
  }

  put<R = T>(url: string, body?: any, options: {
  observe?: 'body';   // Only allow 'body' or undefined
  [key: string]: any;
} = {}): Observable<R> {
    return this.http.put<R>(url, body, options);
  }

  delete<R = T>(url: string, options: {
  observe?: 'body';   // Only allow 'body' or undefined
  [key: string]: any;
} = {}): Observable<R> {
    return this.http.delete<R>(url, options);
  }

  patch<R = T>(url: string, body?: any, options: {
  observe?: 'body';   // Only allow 'body' or undefined
  [key: string]: any;
} = {}): Observable<R> {
    return this.http.patch<R>(url, body, options);
  }

  setCache(key: string, value: HttpResponse<any>, ttl: number): void {
    this.cache.set(key, {
      value: structuredClone(value),
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

    return structuredClone(entry.value);
  }

  clearAll() {
    this.cache.clear();
    this.pending.clear();
  }
}
