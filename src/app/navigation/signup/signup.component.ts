import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { TokenStorageService } from '../../token-storage.service';
import { NgForm } from '@angular/forms';
import { MaxLengthValidator} from '@angular/forms';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  model: any = {};
  type: string = "password";
  @ViewChild('f') private form: NgForm;

  isSignedUp = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService, private tokenStorage: TokenStorageService) { }

  ngOnInit() {
  }

  log() {
    console.log(this.form);
  }

  signup() {
    this.authService.signup({
      username: this.model.username,
      password: this.model.password
  }).subscribe(data => {
      console.log(data);
      this.isSignedUp = true;
      this.isSignUpFailed = false;
      this.tokenStorage.saveUsername(data.credentials.username);
      this.tokenStorage.saveToken(data.credentials.accessToken);
      alert(data.result);
      this.router.navigate(['']);
  },
  error => {
    console.log(error);
    this.isSignedUp = false;
    this.isSignUpFailed = true;
    this.tokenStorage.signOut();
    alert(error.error.result);
    // form.resetForm();
  });
}

}
