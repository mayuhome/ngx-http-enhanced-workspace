import { NgModule, ModuleWithProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEnhancedConfig } from './config.interface';
import { HTTP_ENHANCED_CONFIG, HttpEnhancedService } from './http-enhanced.service';
import { loadingInterceptor } from '../interceptors/loading.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { cacheInterceptor } from '../interceptors/cache.interceptor';
import { deduplicateInterceptor } from '../interceptors/deduplicate.interceptor';
import { retryInterceptor } from '../interceptors/retry.interceptor';

export const httpEnhancedInterceptors: HttpInterceptorFn[] = [
  loadingInterceptor,
  errorInterceptor,
  cacheInterceptor,
  deduplicateInterceptor,
  retryInterceptor,
];

function getBaseProviders(config: HttpEnhancedConfig): Provider[] {
  return [
    { provide: HTTP_ENHANCED_CONFIG, useValue: config }
  ];
}

/**
 * Standalone mode support
 * @param config
 * @returns
 */
export function provideHttpEnhanced(config: HttpEnhancedConfig = {}) {
return makeEnvironmentProviders(getBaseProviders(config));
}

/**
 * Module mode support
 * @param config
 * @returns
 */
@NgModule({})
export class HttpEnhancedModule {
  static forRoot(config: HttpEnhancedConfig): ModuleWithProviders<HttpEnhancedModule> {
    return {
      ngModule: HttpEnhancedModule,
      providers: getBaseProviders(config)
    };
  }
}


