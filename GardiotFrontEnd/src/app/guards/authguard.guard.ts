import { Injectable } from "@angular/core";
import { Router, CanActivate } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _route:Router){}

  canActivate(){
    if(localStorage['Bearer']){
      return true;
    }
    this._route.navigate(['/login']);
    return false;
  }
}
