import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GreetingService {
  private readonly apiUrl = 'http://localhost:8080/api/hello';

  constructor(private http: HttpClient) {
    console.log('HttpClient instance:', http);
  }

  getGreeting(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
