import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
 
import { TokenStorageService } from './token-storage.service';
 
const TOKEN_HEADER_KEY = 'Authorization';
 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    // localhost: string = "http://localhost:8080";    
    localhost: string = "https://mydssathenstech.herokuapp.com";


    constructor(private token: TokenStorageService) { }
 
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        console.log(req);        
        let authReq = req;
        let url = req.url;

        if (url && url.startsWith(this.localhost)) {
            const token = this.token.getToken();
            if (token != null) {
                authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
            }
        }
       
        return next.handle(authReq);
    }
}
 
export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];