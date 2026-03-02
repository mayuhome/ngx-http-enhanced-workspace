import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpEnhancedConfig } from './config.interface';

export const HTTP_ENHANCED_CONFIG =
  new InjectionToken<HttpEnhancedConfig>('HTTP_ENHANCED_CONFIG');

@Injectable()
export class HttpEnhancedService<T = any> {
  constructor(
    private http: HttpClient,
    @Optional() @Inject(HTTP_ENHANCED_CONFIG)
    private config?: HttpEnhancedConfig
  ) {
    console.log('HttpEnhancedService created');
  }

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

}
