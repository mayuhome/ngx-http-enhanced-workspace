# ngx-http-enhanced

**Enhanced Angular HttpClient** – 一个开箱即用的 Angular HTTP 客户端增强库，帮助你更优雅、更高效地处理 API 请求。

当前版本：0.0.1  
支持 Angular：17 | 18 | 19 | 20+  
License：MIT

## ✨ 核心功能

- 自动 **Loading** 状态管理（全局或按请求控制）
- 自动 **错误处理** 与友好提示（可自定义）
- **请求缓存**（支持 TTL 过期时间）
- **请求去重**（相同请求在飞行中只发送一次）
- **自动重试**（支持指数退避、可配置次数）
- **基于 Decorator 的 API 声明**（类似 @Get、@Post 方式写接口）
- 完全基于 **RxJS** 高阶运算符实现
- **拦截器链** 设计，易于扩展
- **泛型** 强类型支持
- **可插拔策略模式**（自定义 loading、错误、缓存淘汰、重试逻辑等）

## 为什么选择 ngx-http-enhanced？

| 场景                           | 原生 HttpClient | ngx-http-enhanced                  |
|--------------------------------|------------------|-------------------------------------|
| 重复请求（快速点击）           | 多次发送         | 自动去重，只发一次                  |
| 网络不稳定时                   | 手动处理重试     | 自动重试 + 指数退避                 |
| 频繁查询相同数据               | 每次都请求       | 智能缓存（带 TTL）                  |
| Loading 遮罩管理               | 手动控制         | 自动 show/hide                      |
| 统一错误弹窗/提示              | 每个地方写 catch | 全局拦截 + 可自定义                 |
| 接口定义方式                   | 字符串 URL       | Decorator 声明式（类型安全）        |

## 安装

```bash
npm install ngx-http-enhanced
# 或
yarn add ngx-http-enhanced
# 或
pnpm add ngx-http-enhanced
```

## 快速开始

### 1. 在 Standalone 应用中引入（推荐）

```typescript
// app.config.ts
import { provideHttpEnhanced } from 'ngx-http-enhanced';

export const appConfig: ApplicationConfig = {
  providers: [
    // 一行代码搞定所有配置，包括 HttpClient 和所有拦截器
    provideHttpEnhanced({
      baseUrl: 'https://api.example.com',  // 可选：设置基础 URL
      timeout: 10000,                      // 可选：请求超时时间
      cacheStrategy: {
        ttl: 5 * 60 * 1000,                // 默认缓存 5 分钟
        shouldCache: (req) => req.method === 'GET'
      },
      retryStrategy: {
        maxRetries: 2,                     // 默认重试 2 次
        delay: (attempt) => attempt * 1000 // 每次延迟 1s
      },
      loadingStrategy: {
        showLoading: (req) => !req.url.includes('/no-loading'),
        onStart: () => console.log('Loading 开始'),
        onEnd: () => console.log('Loading 结束')
      },
      errorStrategy: {
        handleError: (err) => {
          console.error('请求错误:', err);
          // 可以在这里调用你的 Toast 服务
        }
      }
    })
  ]
};
```

### 2. 在 NgModule 应用中引入

```typescript
// app.module.ts
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpEnhancedModule } from 'ngx-http-enhanced';
import { 
  deduplicateInterceptor, 
  cacheInterceptor, 
  retryInterceptor,
  loadingInterceptor, 
  errorInterceptor 
} from 'ngx-http-enhanced';

@NgModule({
  imports: [
    HttpClientModule,
    HttpEnhancedModule.forRoot({
      baseUrl: 'https://api.example.com',
      retryStrategy: { maxRetries: 2 }
    })
  ],
  providers: [
    // 手动注册拦截器（注意顺序）
    { provide: HTTP_INTERCEPTORS, useValue: deduplicateInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: cacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: retryInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: loadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: errorInterceptor, multi: true },
  ]
})
export class AppModule {}
```
```
## 2. 使用增强后的服务（推荐）
```typescript
import { HttpEnhancedService } from 'ngx-http-enhanced';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface User { id: number; name: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpEnhancedService) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```
## 3. 使用 Decorator 声明式 API（更推荐）
```typescript
import { Injectable } from '@angular/core';
import { HttpEnhancedService } from 'ngx-http-enhanced';
import { Get, Post } from 'ngx-http-enhanced/decorators';

interface User { id: number; name: string; }

@Injectable({ providedIn: 'root' })
export class UserApi {
  constructor(private http: HttpEnhancedService) {}

  @Get<User[]>('/users')
  getUsers() {}

  @Get<User>('/users/:id')
  getUser(id: number) {}

  @Post<User>('/users')
  createUser(body: { name: string }) {}
}
```
注意：Decorator 方式需要 `baseUrl` 或完整路径支持，可通过配置或服务属性实现。

## 功能详解
### 1. 自动 Loading 管理
```typescript
// 全局 loading（推荐使用 BehaviorSubject + overlay）
this.http.get('/api/data').subscribe({
  next: () => this.loadingService.hide(),
  error: () => this.loadingService.hide()
});
```
拦截器会自动在请求开始时显示 loading，结束/出错时隐藏。

## 2. 缓存 & 去重
```typescript
// 5 分钟缓存 + 自动去重
this.http.get('/api/static-data');  // 第一次请求
this.http.get('/api/static-data');  // 返回缓存
```
## 3. 自动重试
网络波动时自动重试 2 次（可配置），支持指数退避。

## 4. 自定义策略（高级）
```typescript
provideHttpEnhanced({
  cacheStrategy: {
    shouldCache: (req) => req.method === 'GET' && !req.url.includes('no-cache'),
    generateKey: (req) => req.urlWithParams + JSON.stringify(req.body || {})
  }
});
```
## 开发 & 测试状态

 * [x] 核心拦截器链
 * [x] Loading / Error / Cache / Dedupe / Retry
 * [ ] Decorator 支持
 * [ ] 完整单元测试覆盖（进行中）
 * [ ] 多版本 Angular CI 矩阵测试（计划中）
 * [ ] Schematics / ng add 支持（计划中）

## 贡献
欢迎 PR！请阅读 CONTRIBUTING.md。

Fork 本仓库
创建 feature 分支 (`git checkout -b feature/amazing-feature`)
提交代码 (`git commit -m 'Add some amazing feature'`)
Push 到分支 (`git push origin feature/amazing-feature`)
提交 Pull Request

## 许可证
MIT License © 2026 jade

**喜欢这个库？请给仓库点个 ⭐️ 支持一下！**
任何问题或建议，欢迎在 Issues 中提出。
