import "reflect-metadata";
import { HttpEnhancedService } from '../core/http-enhanced.service';
import { Observable } from 'rxjs';

// Type definitions (optional, but recommended for enhanced type safety)
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiMetadata {
  method: HttpMethod;
  path: string;
}

// Key for storing metadata (use Symbol to avoid conflicts)
const API_METADATA_KEY = Symbol('api:metadata');

// Generic decorator factory
function HttpDecoratorFactory<R = any>(method: HttpMethod) {
  return (path: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      // Only record metadata, don't execute request
      const metadata: ApiMetadata = { method, path };
      Reflect.defineMetadata(API_METADATA_KEY, metadata, target, propertyKey);

      // Override method body (descriptor.value)
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        // Here this is the runtime service instance (UserApi instance)
        const service = this as { http: HttpEnhancedService<R>; baseUrl?: string };

        // Must have http
        if (!service.http || !(service.http instanceof HttpEnhancedService)) {
          throw new Error(
            `@${method} decorator can only be used in classes that inject HttpEnhancedService as 'http'`
          );
        }

        // Get baseUrl (from instance property, injected token, or default value)
        const baseUrl = service.baseUrl || ''; // If undefined, default to empty (relative path)

        // Build full URL (support simple path parameter replacement, e.g., /users/:id)
        let fullPath = path;
        if (args.length > 0 && typeof args[0] === 'object') {
          // Support simple path parameter replacement (optional advanced feature)
          // Example: path = '/users/:id', args[0] = { id: 123 } → '/users/123'
          fullPath = path.replace(/:(\w+)/g, (_, key) => args[0][key] ?? `:${key}`);
        }

        const url = `${baseUrl}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;

        // Call corresponding http method based on method type
        const options = args[args.length - 1]; // Last parameter is usually options

        let observable: Observable<R>;

        switch (method) {
          case 'GET':
            observable = service.http.get<R>(url, options);
            break;
          case 'POST':
            observable = service.http.post<R>(url, args[0], options);
            break;
          case 'PUT':
            observable = service.http.put<R>(url, args[0], options);
            break;
          case 'PATCH':
            observable = service.http.patch<R>(url, args[0], options);
            break;
          case 'DELETE':
            observable = service.http.delete<R>(url, options);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
        // Key: if original method exists, let it handle observable
        if (typeof originalMethod === 'function') {
          // Original function receives observable as parameter, returns new observable or other value
          return originalMethod.call(self, observable, ...args);
        }

        // If no original function body, return observable directly
        return observable;
      };

      return descriptor;
    };
  };
}

// Export common methods
export const Get    = HttpDecoratorFactory<any>('GET');
export const Post   = HttpDecoratorFactory<any>('POST');
export const Put    = HttpDecoratorFactory<any>('PUT');
export const Patch  = HttpDecoratorFactory<any>('PATCH');
export const Delete = HttpDecoratorFactory<any>('DELETE');
