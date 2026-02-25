import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpEnhancedConfig } from './config.interface';
import { HttpEnhancedService } from './http-enhanced.service';
import { LoadingInterceptor } from '../interceptors/loading.interceptor';
import { ErrorInterceptor } from '../interceptors/error.interceptor';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { DeduplicateInterceptor } from '../interceptors/deduplicate.interceptor';
import { RetryInterceptor } from '../interceptors/retry.interceptor';

@NgModule({
  providers: [HttpEnhancedService]
})
export class HttpEnhancedModule {
  static forRoot(config: HttpEnhancedConfig = {}): ModuleWithProviders<HttpEnhancedModule> {
    const providers: Provider[] = [
      { provide: 'HTTP_ENHANCED_CONFIG', useValue: config },
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
