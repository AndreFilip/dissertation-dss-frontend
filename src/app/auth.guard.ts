import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';

import { TokenStorageService } from './token-storage.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor (private tokenStorageService: TokenStorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.tokenStorageService.getToken() != null && this.tokenStorageService.getToken() != undefined) {
      return true;
     } else {
      return false;
     }
  }

}
