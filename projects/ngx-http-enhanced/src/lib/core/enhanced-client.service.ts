import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EnhancedClientService {

  constructor(
    private http: HttpClient,
  ) { }

  get<T = any>(
    url: string,
    options: {
      observe?: 'body'; // Only allow 'body' or undefined
      [key: string]: any;
    } = {}
  ): Observable<T> {
    // Generic response
    return this.http.get<T>(url, options);
  }

  post<T = any>(
    url: string,
    body?: any,
    options: {
      observe?: 'body'; // Only allow 'body' or undefined
      [key: string]: any;
    } = {}
  ): Observable<T> {
    return this.http.post<T>(url, body, options);
  }

  put<T = any>(
    url: string,
    body?: any,
    options: {
      observe?: 'body'; // Only allow 'body' or undefined
      [key: string]: any;
    } = {}
  ): Observable<T> {
    return this.http.put<T>(url, body, options);
  }

  delete<T = any>(
    url: string,
    options: {
      observe?: 'body'; // Only allow 'body' or undefined
      [key: string]: any;
    } = {}
  ): Observable<T> {
    return this.http.delete<T>(url, options);
  }

  patch<T = any>(
    url: string,
    body?: any,
    options: {
      observe?: 'body'; // Only allow 'body' or undefined
      [key: string]: any;
    } = {}
  ): Observable<T> {
    return this.http.patch<T>(url, body, options);
  }
}
