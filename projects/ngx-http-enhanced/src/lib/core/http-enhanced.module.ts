import { NgModule, ModuleWithProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpEnhancedConfig } from './config.interface';
import { HTTP_ENHANCED_CONFIG, HttpEnhancedService } from './http-enhanced.service';
import { LoadingInterceptor } from '../interceptors/loading.interceptor';
import { ErrorInterceptor } from '../interceptors/error.interceptor';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { DeduplicateInterceptor } from '../interceptors/deduplicate.interceptor';
import { RetryInterceptor } from '../interceptors/retry.interceptor';

@NgModule()
export class HttpEnhancedModule {
  static forRoot(config: HttpEnhancedConfig = {}): ModuleWithProviders<HttpEnhancedModule> {
    const providers: Provider[] = [
      HttpEnhancedService,
      { provide: HTTP_ENHANCED_CONFIG, useValue: config },
      { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: DeduplicateInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true }
    ];

    // 支持插件：如果 config.plugins 存在，将它们作为额外 interceptors 添加
    if (config.plugins && config.plugins.length > 0) {
      config.plugins.forEach((plugin, index) => {
        providers.push({
          provide: HTTP_INTERCEPTORS,
          useValue: { intercept: plugin },  // 包装成 interceptor 格式
          multi: true
        });
      });
    }

    return {
      ngModule: HttpEnhancedModule,
      providers
    };
  }
}

/**
 * Use this in standalone / bootstrapApplication() apps.
 *
 * NOTE: The consuming app MUST call provideHttpClient(withInterceptorsFromDi())
 * separately to enable HttpClient and class-based interceptors.
 *
 * Example:
 *   providers: [
 *     provideHttpClient(withInterceptorsFromDi()),
 *     provideHttpEnhanced({ ... })
 *   ]
 */
export function provideHttpEnhanced(config: HttpEnhancedConfig = {}) {
  return makeEnvironmentProviders([
    { provide: HTTP_ENHANCED_CONFIG, useValue: config },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: DeduplicateInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    HttpEnhancedService,
  ]);
}
