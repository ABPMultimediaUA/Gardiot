import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { User } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { AppComponent } from "../../app.component";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit{

  user:User={
    id:"",
    name:"",
    password:"",
    password2:"",
    oldPassword:"",
    plan:"",
    birthDate:null
  }

  constructor(
    private _userService:UserService,
    private _route:Router,
    private _appComponent:AppComponent){}

  guardar(user:NgForm){
    this._userService.register(this.user)
        .subscribe(data=>{
            this._appComponent.mensajeEmergente("Te has registrado correctamente!", "primary", "login");
        });
  }

  ngOnInit() {
    if(this._userService.isAuthenticated()){
      this._route.navigate(['/detail']);
    }
  }
}
