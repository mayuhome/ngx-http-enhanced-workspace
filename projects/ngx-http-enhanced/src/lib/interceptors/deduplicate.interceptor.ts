// interceptors/deduplicate.interceptor.ts
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const pending = new Map<string, Observable<any>>();

@Injectable()
export class DeduplicateInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const key = req.urlWithParams + req.method;
    if (pending.has(key)) return pending.get(key)!;
    const shared = next.handle(req).pipe(
      shareReplay(1),
      finalize(() => pending.delete(key))
    );
    pending.set(key, shared);
    return shared;
  }
}
