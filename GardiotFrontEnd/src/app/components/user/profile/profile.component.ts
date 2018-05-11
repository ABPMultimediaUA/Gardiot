import { Component, OnInit, Inject, Renderer } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { User } from "../../../classes/user.class";
import { AppComponent } from "../../../app.component";
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private  user = new User("");
  private  countries: any[] = [];
  private  cities: any[] = [];
  private  selected: string = "";
  private  imgUrl: string = 'https://gardiot.ovh/uploads/avatar/';
  private  uploader: FileUploader;

  constructor(
    public thisDialogRef: MatDialogRef<ProfileComponent>,
    private _detailService: UserService,
    private _route: Router,
    private _ng2ImgMax: Ng2ImgMaxService,
    private _renderer: Renderer
  ) {

  }

  onCloseConfirm() {
        this.thisDialogRef.close('Cancel');
  }
  onCloseCancel() {
    this.thisDialogRef.close('Cancel');
  }

  mostrar() {
    this._detailService.details(this.user)
      .subscribe(data => {
        this.user.id = data.id;
        this.user.birthDate = data.birthDate;
        this.user.photo = data.photo;
        this.user.name = data.name;
        this.user.lastName = data.lastName;
        this.user.city = data.city;
        this.user.countryCode = data.countryCode;
        document.querySelector('.divPhoto').setAttribute('style', `width: 200px; height: 200px;
          background-image: url("${this.imgUrl+this.user.photo}");
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          border: 2px solid #000;
          border-radius: 200px;
          cursor: pointer;
          `);

      },
      error => {
        console.error(error);
        localStorage.clear();
        sessionStorage.clear();
        this._route.navigate(['/login']);
      });
  }

  selectPhoto(e) {
    console.log(e);
    let file = <HTMLInputElement>document.querySelector('input[type="file"]');
    file.click();
  }

  uploadPhoto(event) {
    if (this.uploader.getNotUploadedItems().length) {
      console.log(event.target.files);
      let file = [];
      file.push(event.target.files[0]);
      file.forEach(function() {
        console.log(file);
      });
      this._ng2ImgMax.compress(file, 1.25).subscribe(
        result => {
          const newImage = new File([result], result.name);
          this.uploader.clearQueue();
          this.uploader.addToQueue([newImage]);
          this.uploader.uploadAll();
        },
        error => console.log(error)
      );


    }
  }


  ngOnInit() {
    if(window.location.toString().indexOf("localhost")>=0){
      this.imgUrl="http://localhost:4200/assets/images/imgProfile/";
    }
    else if(window.location.toString().indexOf("gardiot")>=0){
      this.imgUrl="https://gardiot.ovh/app/assets/images/imgProfile/";
    }
    this.uploader = new FileUploader({ url: this._detailService.apiURL + 'uploadAvatar', itemAlias: 'photo' });
    this.mostrar();

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log("ImageUpload:uploaded:", item, status, response);

      let url = response.split(" ");
      url = url[url.length - 1];
      url = url.split("\\");
      url = url[url.length - 1];
      this.user.photo = url;
      let img = document.querySelector(".divPhoto");


      this._detailService.savePhotoUser(this.user.photo)
        .subscribe(data => {
          console.log(data);
          if (data.Mensaje == 'Actualizado')
            this._renderer.setElementStyle(img, 'background-image', `url("${this.imgUrl+this.user.photo}")`);
        });
    };

  }
}
