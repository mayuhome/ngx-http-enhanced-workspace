import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpEnhancedConfig } from './config.interface';

@Injectable()
export class HttpEnhancedService<T = any> {  // 泛型 T 为响应类型
  constructor(
    private http: HttpClient,
    @Optional() @Inject('HTTP_ENHANCED_CONFIG') private config?: HttpEnhancedConfig
  ) {}

  get<R = T>(url: string, options?: any) {  // 泛型响应
    return this.http.get<R>(url, options);
  }

  post<R = T>(url: string, body?: any, options?: any) {
    return this.http.post<R>(url, body, options);
  }

  put<R = T>(url: string, body?: any, options?: any) {
    return this.http.put<R>(url, body, options);
  }

  delete<R = T>(url: string, options?: any) {
    return this.http.delete<R>(url, options);
  }

  patch<R = T>(url: string, body?: any, options?: any) {
    return this.http.patch<R>(url, body, options);
  }

}
