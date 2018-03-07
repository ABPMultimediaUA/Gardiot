import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { UserService } from '../../../services/user.service';
import { User } from '../../../classes/user.class';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-user',
  templateUrl: './newuser.component.html',
  styles: []
})
export class NewuserComponent implements OnInit {

  user=new User();
  constructor(private _newUserServce:UserService,
  private _appComponent:AppComponent) { }

  guardarUsuario(forma:NgForm){
    console.log(forma.value);
    if(forma.value.admin==true){
      forma.value.admin=1;
    }
    this._newUserServce.registerAdmin(forma.value)
      .subscribe(data=>{
        this._appComponent.mensajeEmergente("Registrado con exito", "primary", "admin/users");
      })

  }

  ngOnInit() {
  }

}
