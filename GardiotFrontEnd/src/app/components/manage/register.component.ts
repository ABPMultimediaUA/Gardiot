import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UserService } from "../../services/user.service";
import { User } from "../../classes/user.class";
import { Router } from "@angular/router";
import { AppComponent } from "../../app.component";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit{

  user=new User("");

  constructor(
    private _userService:UserService,
    private _route:Router,
    private _appComponent:AppComponent){}

  guardar(){
    console.log(this.user);
    this._userService.register(this.user)
        .subscribe(data=>{
          if(window.location.toString().indexOf("gardiot")>=0){
            this._appComponent.mensajeEmergente("Te has registrado correctamente, confirma tu correo para poder iniciar sesión", "primary", "login");
          }
          else{
            this._route.navigate(['/detail']);
          }
        },
        error=>{
          let v=JSON.parse(error._body);
          console.log(v.Mensaje);
          this._appComponent.mensajeEmergente(v.Mensaje, "danger", "");
        });
  }

  ngOnInit() {
    if(this._userService.isUserAuthenticated()){
      this._route.navigate(['/detail']);
    }
  }
}
