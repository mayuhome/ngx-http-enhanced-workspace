import { MonoTypeOperatorFunction, shareReplay } from 'rxjs';
export function withCache<T>(ttl: number): MonoTypeOperatorFunction<T> {
  // 实现类似 cache interceptor 的 pipe 操作符
  return (source) => source.pipe(
    shareReplay({ bufferSize: 1, refCount: true, windowTime: ttl })
  );
}
