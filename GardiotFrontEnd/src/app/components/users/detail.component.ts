import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from '../../classes/user.class';
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit{

  user=new User("");

  constructor(
    private _detailService:UserService,
    private _route:Router ){ }

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


  ngOnInit() {
    this.mostrar();
  }


}
