// 核心模块和服务
export * from './lib/core/http-enhanced.module';
export * from './lib/core/http-enhanced.service';
export * from './lib/core/config.interface';

// 装饰器（最常用入口之一）
// export * from './lib/decorators/api.decorator';

// 可选：如果用户想单独使用某个 interceptor（高级用法）
export * from './lib/interceptors/loading.interceptor';
export * from './lib/interceptors/error.interceptor';
export * from './lib/interceptors/cache.interceptor';
export * from './lib/interceptors/deduplicate.interceptor';
export * from './lib/interceptors/retry.interceptor';

export { HTTP_ENHANCED_CONFIG } from './lib/core/http-enhanced.service';
