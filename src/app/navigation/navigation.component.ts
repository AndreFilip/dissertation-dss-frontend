import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../token-storage.service';
import { ActivatedRoute , Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../components/modal/modal.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  isLoggedIn: any;
  isLoggedInUsername: any ;

  constructor(private tokenStorageService: TokenStorageService, private router: Router, private modalService: NgbModal) { }

  ngOnInit() {
    if (this.tokenStorageService.getToken() != null && this.tokenStorageService.getToken() != undefined) {
      this.isLoggedIn = true;
      this.isLoggedInUsername = this.tokenStorageService.getUsername();
    } else {
      this.isLoggedIn = false;
      this.isLoggedInUsername = null;
    }
    
    this.tokenStorageService.loggedInSubject.subscribe( (result) => { 
      this.isLoggedIn = result; 
      if (result) {
        this.isLoggedInUsername = this.tokenStorageService.getUsername();       
      }
    });

  }

  logout() {
    let result = confirm("Are you sure you want to log out?");
    if (result) {
      this.router.navigate(['']);
      this.tokenStorageService.signOut();
      this.openModal("Successully logged out.");
    }
  }

  openModal(message: string) {
  let modalRef = this.modalService.open(ModalComponent);
  modalRef.componentInstance.result = message;
}

}
