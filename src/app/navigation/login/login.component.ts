import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../../auth.service';
import { TokenStorageService } from '../../token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  type: string = "password";

  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService, private tokenStorage: TokenStorageService
    ) { }
 
    ngOnInit() {  
    }
 
    login() {
        this.authService.login({
          username: this.model.username,
          password: this.model.password
      }).subscribe(data => {
        console.log(data);
        if (data.accessToken) {
          this.tokenStorage.saveUsername(data.username);
          this.tokenStorage.saveToken(data.accessToken);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          alert("Successully logged in.");
          this.router.navigate(['']);
        } else {
          alert("Authentication failed.");
          this.tokenStorage.signOut();
        }
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
        this.isLoginFailed = true;
        this.tokenStorage.signOut();
        if (error.status == 401) {
          alert("Wrong credentials. Try again.");
        }
      });
    }

}

// ngOnInit() {
//   this.info = {
//     token: this.token.getToken(),
//     username: this.token.getUsername(),
//     authorities: this.token.getAuthorities()
//   };
// }

// logout() {
//   this.token.signOut();
//   window.location.reload();
// }
