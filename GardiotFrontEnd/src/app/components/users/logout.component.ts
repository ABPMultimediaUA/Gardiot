import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
@Component({
  template: ''
})

export class LogoutComponent implements OnInit {

  constructor(
    private _logoutService:UserService,
    private _route:Router) {}

  ngOnInit() {
    this._logoutService.logout();
    this._route.navigate(['/login']);
  }

}
