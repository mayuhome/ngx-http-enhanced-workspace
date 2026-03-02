// Core modules and services
export * from './lib/core/http-enhanced.module';
export * from './lib/core/http-enhanced.service';
export * from './lib/core/config.interface';

// Decorators (one of the most common entry points)
// export * from './lib/decorators/api.decorator';

// Optional: if users want to use a specific interceptor individually (advanced usage)
export * from './lib/interceptors/loading.interceptor';
export * from './lib/interceptors/error.interceptor';
export * from './lib/interceptors/cache.interceptor';
export * from './lib/interceptors/deduplicate.interceptor';
export * from './lib/interceptors/retry.interceptor';

export { HTTP_ENHANCED_CONFIG } from './lib/core/http-enhanced.service';
