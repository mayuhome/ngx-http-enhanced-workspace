import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpEnhancedService } from 'ngx-http-enhanced';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  posts: Post[] = [];
  createdPost: Post | null = null;
  updatedPost: Post | null = null;
  deleteResult: any = null;
  patchedPost: Post | null = null;
  errorMessage: string = '';
  user: User | null = null;
  deduplicateResult: any = null;
  logs: string[] = [];

  constructor(private httpService: HttpEnhancedService) {}

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    console.log(message);
  }

  testGet() {
    this.addLog('开始 GET 请求测试...');
    this.httpService.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .subscribe({
        next: (data) => {
          this.posts = data;
          this.addLog(`GET 请求成功，获取到 ${data.length} 篇文章`);
        },
        error: (err) => {
          this.addLog(`GET 请求失败: ${err.message}`);
        }
      });
  }

  testPost() {
    this.addLog('开始 POST 请求测试...');
    const newPost = {
      title: '测试文章',
      body: '这是一篇测试文章的内容',
      userId: 1
    };

    this.httpService.post<Post>('https://jsonplaceholder.typicode.com/posts', newPost)
      .subscribe({
        next: (data) => {
          this.createdPost = data;
          this.addLog(`POST 请求成功，创建文章 ID: ${data.id}`);
        },
        error: (err) => {
          this.addLog(`POST 请求失败: ${err.message}`);
        }
      });
  }

  testPut() {
    this.addLog('开始 PUT 请求测试...');
    const updatedPost = {
      id: 1,
      title: '更新后的标题',
      body: '更新后的内容',
      userId: 1
    };

    this.httpService.put<Post>('https://jsonplaceholder.typicode.com/posts/1', updatedPost)
      .subscribe({
        next: (data) => {
          this.updatedPost = data;
          this.addLog(`PUT 请求成功，更新文章 ID: ${data.id}`);
        },
        error: (err) => {
          this.addLog(`PUT 请求失败: ${err.message}`);
        }
      });
  }

  testDelete() {
    this.addLog('开始 DELETE 请求测试...');
    this.httpService.delete<any>('https://jsonplaceholder.typicode.com/posts/1')
      .subscribe({
        next: (data) => {
          this.deleteResult = data;
          this.addLog('DELETE 请求成功');
        },
        error: (err) => {
          this.addLog(`DELETE 请求失败: ${err.message}`);
        }
      });
  }

  testPatch() {
    this.addLog('开始 PATCH 请求测试...');
    const patchData = {
      title: '部分更新的标题'
    };

    this.httpService.patch<Post>('https://jsonplaceholder.typicode.com/posts/1', patchData)
      .subscribe({
        next: (data) => {
          this.patchedPost = data;
          this.addLog(`PATCH 请求成功，更新文章 ID: ${data.id}`);
        },
        error: (err) => {
          this.addLog(`PATCH 请求失败: ${err.message}`);
        }
      });
  }

  testError() {
    this.addLog('开始错误处理测试...');
    this.httpService.get<any>('https://jsonplaceholder.typicode.com/invalid-endpoint')
      .subscribe({
        next: (data) => {
          this.addLog('意外成功');
        },
        error: (err) => {
          this.errorMessage = `错误状态: ${err.status}, 消息: ${err.message}`;
          this.addLog(`错误被捕获: ${err.status} - ${err.statusText}`);
        }
      });
  }

  testCache() {
    this.addLog('开始缓存测试...');
    this.httpService.get<User>('https://jsonplaceholder.typicode.com/users/1')
      .subscribe({
        next: (data) => {
          this.user = data;
          this.addLog(`缓存测试成功，获取用户: ${data.name}`);
        },
        error: (err) => {
          this.addLog(`缓存测试失败: ${err.message}`);
        }
      });
  }

  testDeduplicate() {
    this.addLog('开始去重测试...');
    const url = 'https://jsonplaceholder.typicode.com/posts/1';

    this.httpService.get<Post>(url).subscribe({
      next: (data) => {
        this.deduplicateResult = data;
        this.addLog(`去重测试成功，获取文章: ${data.title}`);
      },
      error: (err) => {
        this.addLog(`去重测试失败: ${err.message}`);
      }
    });

    this.httpService.get<Post>(url).subscribe({
      next: (data) => {
        this.addLog(`去重测试 - 第二个请求完成 (应该被去重): ${data.title}`);
      },
      error: (err) => {
        this.addLog(`去重测试 - 第二个请求失败: ${err.message}`);
      }
    });
  }
}
