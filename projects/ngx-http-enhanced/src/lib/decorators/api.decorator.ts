import "reflect-metadata";
import { HttpEnhancedService } from '../core/http-enhanced.service';
import { Observable } from 'rxjs';

// 类型定义（可选，但推荐增强类型安全）
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiMetadata {
  method: HttpMethod;
  path: string;
}

// 存储元数据的 key（使用 Symbol 避免冲突）
const API_METADATA_KEY = Symbol('api:metadata');

// 通用 decorator 工厂
function HttpDecoratorFactory<R = any>(method: HttpMethod) {
  return (path: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      // 只记录元数据，不执行请求
      const metadata: ApiMetadata = { method, path };
      Reflect.defineMetadata(API_METADATA_KEY, metadata, target, propertyKey);

      // 重写方法体（descriptor.value）
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        // 这里 this 是运行时的服务实例（UserApi 的实例）
        const service = this as { http: HttpEnhancedService<R>; baseUrl?: string };

        // 必须有 http
        if (!service.http || !(service.http instanceof HttpEnhancedService)) {
          throw new Error(
            `@${method} decorator can only be used in classes that inject HttpEnhancedService as 'http'`
          );
        }

        // 获取 baseUrl（从实例属性、注入 token 或默认值）
        const baseUrl = service.baseUrl || ''; // 如果没定义，默认为空（相对路径）

        // 构建完整 URL（支持路径参数简单替换，如 /users/:id）
        let fullPath = path;
        if (args.length > 0 && typeof args[0] === 'object') {
          // 支持简单路径参数替换（可选高级功能）
          // 示例：path = '/users/:id'，args[0] = { id: 123 } → '/users/123'
          fullPath = path.replace(/:(\w+)/g, (_, key) => args[0][key] ?? `:${key}`);
        }

        const url = `${baseUrl}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;

        // 根据方法调用对应的 http 方法
        const options = args[args.length - 1]; // 最后一个参数通常是 options

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
        // 关键：如果原始方法存在，就让它处理 observable
        if (typeof originalMethod === 'function') {
          // 原函数接收 observable 作为参数，返回新的 observable 或其他值
          return originalMethod.call(self, observable, ...args);
        }

        // 如果没有原始函数体，直接返回 observable
        return observable;
      };

      return descriptor;
    };
  };
}

// 导出常用方法
export const Get    = HttpDecoratorFactory<any>('GET');
export const Post   = HttpDecoratorFactory<any>('POST');
export const Put    = HttpDecoratorFactory<any>('PUT');
export const Patch  = HttpDecoratorFactory<any>('PATCH');
export const Delete = HttpDecoratorFactory<any>('DELETE');
