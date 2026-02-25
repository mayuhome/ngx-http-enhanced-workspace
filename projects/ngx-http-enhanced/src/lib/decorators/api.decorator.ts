import "reflect-metadata";
import { HttpEnhancedService } from '../core/http-enhanced.service';

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

        switch (method) {
          case 'GET':
            return service.http.get<R>(url, options);
          case 'POST':
            return service.http.post<R>(url, args[0], options);
          case 'PUT':
            return service.http.put<R>(url, args[0], options);
          case 'PATCH':
            return service.http.patch<R>(url, args[0], options);
          case 'DELETE':
            return service.http.delete<R>(url, options);
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
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
