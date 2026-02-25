import { HttpRequest } from '@angular/common/http';

export const defaultLoadingStrategy = {
  showLoading: (req: HttpRequest<any>) => true,  // 默认所有请求显示
  onStart: () => { /* 可注入 loading service show */ },
  onEnd: () => { /* 可注入 loading service hide */ }
};
