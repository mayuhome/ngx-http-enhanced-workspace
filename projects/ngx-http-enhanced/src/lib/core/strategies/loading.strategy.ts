import { HttpRequest } from '@angular/common/http';

export const defaultLoadingStrategy = {
  showLoading: (req: HttpRequest<any>) => false,  // 默认所有请求不显示 loading
  onStart: () => { /* 可注入 loading service show */ },
  onEnd: () => { /* 可注入 loading service hide */ }
};
