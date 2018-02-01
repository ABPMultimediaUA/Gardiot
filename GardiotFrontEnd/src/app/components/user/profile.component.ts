import { Component} from '@angular/core';
import { Router } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { UserService} from "../../services/user.service";
import { User } from "../../classes/user.class";
import { AppComponent } from "../../app.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  user=new User("");
  countries:any[] = [];

  constructor(
    private _detailService:UserService,
    private _route:Router,
    private _appComponent:AppComponent){ }

    //Cargar usuario para mostrar sus datos en el formulario por defecto
  mostrar(){
    this._detailService.details(this.user)
        .subscribe(data=>{
          console.log(data);
          this.user.id=data.id;
          this.user.birthDate=data.birthDate;
          this.user.plan=data.plan;
          this.user.name=data.name;
        },
      error => {
        console.error(error);
        localStorage.clear();
        sessionStorage.clear();
        this._route.navigate(['/login']);
      });
    }

    //Enviar los nuevos datos del usuario a UserService para guardarlos
    edit(){
      this._detailService.modifyUserProfile(this.user, this.user.id)
          .subscribe(data=>{
            this._appComponent.mensajeEmergente("Datos modificados", "success", "detail");
          },
        error => {
          let v=JSON.parse(error._body);
          this._appComponent.mensajeEmergente(v.Mensaje, "danger", "");
        });
      }


  ngOnInit() {
    this.mostrar();
    this.listarPaises();
  }

  listarPaises() {
    this._detailService.listCoutries()
      .subscribe(data=> {
        //console.log(data.geonames);
        for(let key$ in data){
            //console.log(data[key$]);
            this.countries.push(data[key$]);
          }
          console.log(this.countries);
          console.log(this.countries[0][0]);
      },
      error => {
        console.log(error);
      })
  }


  }
