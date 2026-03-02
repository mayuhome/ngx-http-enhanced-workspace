import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ErrorInterceptor } from './error.interceptor';
import { HTTP_ENHANCED_CONFIG } from '../core/http-enhanced.service';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let handleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    handleErrorSpy = jasmine.createSpy('handleError');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        },
        {
          provide: HTTP_ENHANCED_CONFIG,
          useValue: {
            errorStrategy: {
              handleError: handleErrorSpy
            }
          }
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call handleError on error', (done) => {

    http.get<any>('https://api.test.com/data').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
        expect(handleErrorSpy).toHaveBeenCalledWith(error);
        done();
      }
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush('Test error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should rethrow the error after handling', (done) => {

    http.get<any>('https://api.test.com/data').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(handleErrorSpy).toHaveBeenCalledWith(error);
        done();
      }
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.flush('Test error', { status: 404, statusText: 'Not Found' });
  });

  it('should handle network errors', (done) => {

    http.get<any>('https://api.test.com/data').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(0);
        expect(error.statusText).toBe('Unknown Error');
        expect(handleErrorSpy).toHaveBeenCalledWith(error);
        done();
      }
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    req.error(new ErrorEvent('Network Error'));
  });
});
