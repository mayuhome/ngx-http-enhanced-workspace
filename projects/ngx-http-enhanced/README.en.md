# ngx-http-enhanced

**Enhanced Angular HttpClient** – An out-of-the-box Angular HTTP client enhancement library that helps you handle API requests more elegantly and efficiently.

Current version: 0.0.1  
Supports Angular: 17 | 18 | 19 | 20+  
License: MIT

## ✨ Core Features

- Automatic **Loading** state management (global or per-request control)
- Automatic **error handling** with friendly prompts (customizable)
- **Request caching** (supports TTL expiration)
- **Request deduplication** (same request in flight only sends once)
- **Automatic retry** (supports exponential backoff, configurable times)
- **Decorator-based API declaration** (similar to @Get, @Post style)
- Fully implemented based on **RxJS** higher-order operators
- **Interceptor chain** design, easy to extend
- **Generic** strong type support
- **Pluggable strategy pattern** (custom loading, error, cache eviction, retry logic, etc.)

## Why choose ngx-http-enhanced?

| Scenario                       | Native HttpClient | ngx-http-enhanced                 |
|--------------------------------|------------------|-----------------------------------|
| Duplicate requests (quick clicks) | Multiple sends   | Automatic deduplication, only once |
| Network instability            | Manual retry handling | Automatic retry + exponential backoff |
| Frequent queries for same data | Every time request | Intelligent caching (with TTL)    |
| Loading mask management        | Manual control   | Automatic show/hide               |
| Unified error popup/prompt     | Write catch everywhere | Global interception + customizable |
| API definition method          | String URL       | Decorator declarative (type-safe) |

## Installation

```bash
npm install ngx-http-enhanced
# or
yarn add ngx-http-enhanced
# or
pnpm add ngx-http-enhanced
```

## Quick Start
### 1. Import in AppModule / Standalone
```typescript
// app.config.ts or app.module.ts
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpEnhanced } from 'ngx-http-enhanced';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpEnhanced({
      // Optional: global configuration
      cacheTtl: 5 * 60 * 1000,      // Default cache 5 minutes
      retryCount: 2,                // Default retry 2 times
      // loadingStrategy: (req) => !req.url.includes('/no-loading'),
      // errorHandler: (err) => showCustomToast(err)
    })
  ]
});
```
## 2. Use the enhanced service (recommended)
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
## 3. Use Decorator declarative API (more recommended)
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
Note: Decorator method requires `baseUrl` or full path support, which can be implemented through configuration or service properties.

## Feature Details
### 1. Automatic Loading Management
```typescript
// Global loading (recommended to use BehaviorSubject + overlay)
this.http.get('/api/data').subscribe({
  next: () => this.loadingService.hide(),
  error: () => this.loadingService.hide()
});
```
The interceptor will automatically show loading at the start of the request and hide it when it ends/errors.

## 2. Cache & Deduplication
```typescript
// 5 minutes cache + automatic deduplication
this.http.get('/api/static-data');  // First request
this.http.get('/api/static-data');  // Return cache
```
## 3. Automatic Retry
Automatically retry 2 times (configurable) when network fluctuates, supporting exponential backoff.

## 4. Custom Strategy (Advanced)
```typescript
provideHttpEnhanced({
  cacheStrategy: {
    shouldCache: (req) => req.method === 'GET' && !req.url.includes('no-cache'),
    generateKey: (req) => req.urlWithParams + JSON.stringify(req.body || {})
  }
});
```
## Development & Testing Status

 * [x] Core interceptor chain
 * [x] Loading / Error / Cache / Dedupe / Retry
 * [x] Decorator support
 * [ ] Full unit test coverage (in progress)
 * [ ] Multi-version Angular CI matrix testing (planned)
 * [ ] Schematics / ng add support (planned)

## Contribution
Welcome PR! Please read CONTRIBUTING.md.

Fork this repository
Create feature branch (`git checkout -b feature/amazing-feature`)
Commit code (`git commit -m 'Add some amazing feature'`)
Push to branch (`git push origin feature/amazing-feature`)
Submit Pull Request

## License
MIT License © 2026 jade

**Like this library? Please give the repository a ⭐️ support!**
Any questions or suggestions, welcome to raise in Issues.
