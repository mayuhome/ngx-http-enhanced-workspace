import { HttpEnhancedService } from 'ngx-http-enhanced';

import { inject, Injectable } from '@angular/core';

@Injectable()
export class TestApiService {

  readonly baseUrl = 'https://jsonplaceholder.typicode.com/';

  readonly httpService = inject(HttpEnhancedService);

  get<T>(url: string) {
    return this.httpService.get<T>(`${this.baseUrl}${url}`);
  }

  post<T>(url: string, data: any) {
    return this.httpService.post<T>(`${this.baseUrl}${url}`, data);
  }

  put<T>(url: string, data: any) {
    return this.httpService.put<T>(`${this.baseUrl}${url}`, data);
  }

  delete<T>(url: string) {
    return this.httpService.delete<T>(`${this.baseUrl}${url}`);
  }

  patch<T>(url: string, data: any) {
    return this.httpService.patch<T>(`${this.baseUrl}${url}`, data);
  }
}
