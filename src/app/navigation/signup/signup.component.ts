import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { TokenStorageService } from '../../token-storage.service';
import { NgForm } from '@angular/forms';
import { MaxLengthValidator} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  model: any = {};
  type: string = "password";
  loading: boolean = false;
  @ViewChild('f') private form: NgForm;

  isSignedUp = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService, private tokenStorage: TokenStorageService, private modalService: NgbModal) { }

  ngOnInit() {
  }

  log() {
    console.log(this.form);
  }

  signup() {
    this.loading = true;
    this.authService.signup({
      username: this.model.username,
      password: this.model.password
  }).subscribe(data => {
      this.loading = false;
      console.log(data);
      this.isSignedUp = true;
      this.isSignUpFailed = false;
      this.tokenStorage.saveUsername(data.credentials.username);
      this.tokenStorage.saveToken(data.credentials.accessToken);
      // alert(data.result);
      this.openModal(data.result);
      this.router.navigate(['']);
  },
  error => {
    console.log(error);
    this.isSignedUp = false;
    this.isSignUpFailed = true;
    this.tokenStorage.signOut();
    // alert(error.error.result);
    this.openModal(error.error.result);
    this.loading = false;
    // form.resetForm();
  });
}

openModal(message: string) {
  let modalRef = this.modalService.open(ModalComponent);
  modalRef.componentInstance.result = message;
}

}
