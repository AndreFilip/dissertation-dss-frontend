import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private loginUrl = 'http://localhost:8080/auth/login';
  // private signupUrl = 'http://localhost:8080/auth/register';
  // https://mydssathenstech.herokuapp.com/
  private loginUrl = 'https://mydssathenstech.herokuapp.com/auth/login';
  private signupUrl = 'https://mydssathenstech.herokuapp.com/auth/register';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials, httpOptions);
  }
 
  signup(info: any): Observable<any> {
    return this.http.post<any>(this.signupUrl, info, httpOptions);
  }



}
