import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../token-storage.service';
import { ActivatedRoute , Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  isLoggedIn: any;
  isLoggedInUsername: any ;

  constructor(private tokenStorageService: TokenStorageService, private router: Router) { }

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
    this.router.navigate(['']);
    this.tokenStorageService.signOut();
    alert("Successully logged out.");    
  }

}
