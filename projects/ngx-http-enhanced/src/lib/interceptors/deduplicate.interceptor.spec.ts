import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeduplicateInterceptor } from './deduplicate.interceptor';

describe('DeduplicateInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: DeduplicateInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should deduplicate identical requests', (done) => {
    const testData = { id: 1, name: 'Test' };
    let callCount = 0;

    http.get<any>('https://api.test.com/data').subscribe(data => {
      callCount++;
      expect(data).toEqual(testData);
      if (callCount === 2) {
        done();
      }
    });

    http.get<any>('https://api.test.com/data').subscribe(data => {
      callCount++;
      expect(data).toEqual(testData);
      if (callCount === 2) {
        done();
      }
    });

    const req = httpMock.expectOne('https://api.test.com/data');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should not deduplicate different requests', (done) => {
    const testData1 = { id: 1, name: 'Test1' };
    const testData2 = { id: 2, name: 'Test2' };
    let callCount = 0;

    http.get<any>('https://api.test.com/data1').subscribe(data => {
      callCount++;
      expect(data).toEqual(testData1);
      if (callCount === 2) {
        done();
      }
    });

    http.get<any>('https://api.test.com/data2').subscribe(data => {
      callCount++;
      expect(data).toEqual(testData2);
      if (callCount === 2) {
        done();
      }
    });

    const req1 = httpMock.expectOne('https://api.test.com/data1');
    const req2 = httpMock.expectOne('https://api.test.com/data2');
    req1.flush(testData1);
    req2.flush(testData2);
  });

  it('should not deduplicate requests with same URL but different methods', () => {
    const testData = { id: 1, name: 'Test' };
    let getResponseReceived = false;
    let postResponseReceived = false;

    // Send GET request
    http.get<any>('https://api.test.com/data').subscribe(data => {
      expect(data).toEqual(testData);
      getResponseReceived = true;
    });

    // Send POST request to same URL
    http.post<any>('https://api.test.com/data', testData).subscribe(data => {
      expect(data).toEqual(testData);
      postResponseReceived = true;
    });

    // Verify GET request was sent
    const getReq = httpMock.expectOne(req => req.url === 'https://api.test.com/data' && req.method === 'GET');
    getReq.flush(testData);

    // Verify POST request was also sent (should not be deduplicated)
    const postReq = httpMock.expectOne(req => req.url === 'https://api.test.com/data' && req.method === 'POST');
    postReq.flush(testData);

    // Verify both requests received responses
    expect(getResponseReceived).toBe(true);
    expect(postResponseReceived).toBe(true);
  });
});
