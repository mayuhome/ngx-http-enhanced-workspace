import { MonoTypeOperatorFunction, shareReplay } from 'rxjs';
export function withCache<T>(ttl: number): MonoTypeOperatorFunction<T> {
  // Implement pipe operator similar to cache interceptor
  return (source) => source.pipe(
    shareReplay({ bufferSize: 1, refCount: true, windowTime: ttl })
  );
}
