import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { GardenService } from "../../../services/garden.service";
import { Garden } from "../../../classes/garden.class";
import { PlantService } from "../../../services/plant.service";
import { Plant } from "../../../classes/plant.class";
import { AppComponent } from "../../../app.component";
import { Observable } from 'rxjs/Observable';
import { Select2OptionData } from 'ng2-select2';
import { DialogHelpGardenComponent } from '../../dialog-gardenhelp/dialog-help-garden.component';
import { DialogAllGardensComponent } from '../../dialog-allgardens/dialog-allgardens';
import { RouterLink, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogNewgarden0Component } from '../../dialog-newgarden/dialog-newgarden0/dialog-newgarden0.component';
import 'rxjs/add/operator/delay';

declare var iniciar: any;
declare var window:any;
declare var motor: any;
declare var vec3:any;
declare var hammertime: any;


@Component({
  selector: 'app-garden',
  templateUrl: './garden.component.html',
  styleUrls: ['./garden.component.css'
    //'../editgarden/editgarden.component.css'
  ]
})
export class GardenComponent {
  private garden = new Garden("");

  private mobile=false;


  private temperatura = 0;
  private prevHoy = [];
  private prevMan = [];
  private prevDia3 = [];
  private prevDia4 = [];
  private prevDia5 = [];

  private fotoHoy = "default";
  private fotoMan = "default";
  private fotoDia3 = "default";
  private fotoDia4 = "default";
  private fotoDia5 = "default";

  private statusHoy = "Clear";
  private statusMan = "Clear";
  private statusDia3 = "Clear";
  private statusDia4 = "Clear";
  private statusDia5 = "Clear";

  private colorHoy = "#fcfcfc";
  private colorMan = "#fcfcfc";
  private colorDia3 = "#fcfcfc";
  private colorDia4 = "#fcfcfc";
  private colorDia5 = "#fcfcfc";

  private maxMan = 0;
  private maxDia3 = 0;
  private maxDia4 = 0;
  private maxDia5 = 0;

  private minMan = 0;
  private minDia3 = 0;
  private minDia4 = 0;
  private minDia5 = 0;

  private nombreDia3 = "";
  private nombreDia4 = "";
  private nombreDia5 = "";

  private tercerDia: string = "";
  private visible = 0;//0 visualización
                      //1 edición
                      //2 jardín externo
  private haveWeather = false;

  private sunrise;
  private sunset;

  private countries: any[] = [];
  private cities: any[] = [];
  private zip: string = "";
  private countryData: Observable<Array<Select2OptionData>>;
  private startCountry: Observable<string>;
  private cityData: Observable<Array<Select2OptionData>>;
  private startCity: Observable<string>;
  private city: string;
  private tiempoCity: string = "El tiempo";


  private photoURL = "";
  private accion: string;
  private width: number;
  private length: number;

  //paginación y buscador
  private numeroItems: number;
  private paginaActual: number = 1;
  private elementosPorPagina: number = 5;
  private estado: boolean = false;// false es listado y true buscador
  private plantmotor: number[];
  private plantsmotor: any[] = [];
  private plant = new Plant();


  constructor(
    private _gardenService: GardenService,
    private _plantService: PlantService,
    private _route: Router,
    private _appComponent: AppComponent,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
  ) {
    if (window.location.toString().indexOf("localhost") >= 0) {
      this.photoURL = "/assets";
    }
    else if (window.location.toString().indexOf("gardiot") >= 0) {
      this.photoURL = "/app/assets";
    }
  }


  @HostListener('document:keyup', ['$event'])

  searchZip(event: KeyboardEvent): void {
    //aqui vamos cargando las posibles ciudades a elegir
    let input = (<HTMLInputElement>document.querySelector("#zipCode"));
    if (input.value.length == 5) {
      console.log("callCity");
      this._gardenService.listCitiesByZip(this.garden.countryCode, input.value)
        .subscribe(data => {
          let sp = document.querySelector('#ciudad');

          if (data.length > 0) {
            console.log(data[0]);
            this.garden.latitude = data[0].lat.toFixed(2);
            this.garden.longitude = data[0].lng.toFixed(2);
            if (data[0].adminName3 !== undefined && !data[0].adminName3.includes("/")) {
              this.garden.city = data[0].adminName3;
              this.city = data[0].adminName3;
              console.log(this.city);
            }
            else if (data[0].placeName !== undefined) {
              this.garden.city = data[0].placeName;
              this.city = data[0].placeName;
              console.log(this.city);
            }
            else if (data[0].adminName2 !== undefined) {
              this.garden.city = data[0].adminName2;
              this.city = data[0].adminName2;
            }
            else if (data[0].adminName1 !== undefined) {
              this.garden.city = data[0].adminName1;
              this.city = data[0].adminName1;
            }
            else {
              this.garden.city = '';
              this.city = 'Código postal no encontrado';
            }
          }
          else {
            this.garden.city = '';
            this.city = 'Código postal no encontrado';
          }
          input.value = '';

        },
          error => {
            console.error(error);
          });
    }
  }

  listarPaises() {
    this._gardenService.listCoutries()
      .subscribe(data => {
        let aux = [];
        aux.push({ id: 0, text: "Selecciona un país" });
        for (let i = 0; i < data.geonames.length; i++) {
          aux.push({ id: data.geonames[i].countryCode, text: data.geonames[i].countryName });
        }



        this.countryData = Observable.create((obs) => {
          obs.next(aux);
          obs.complete();
        });
        this.startCountry = Observable.create((obs) => {
          obs.next(this.garden.countryCode);
          obs.complete();
        });
      },
        error => {
          console.error(error);
        });

  }


  mostrarCiudad() {

    let aux = [];
    aux.push({ id: this.garden.city, text: this.garden.city });
    this.city = this.garden.city;
    this.tiempoCity = 'El tiempo en ' + this.garden.city;
    this.cityData = Observable.create((obs) => {
      obs.next(aux);
      obs.complete();
    });

  }

  mostrar() {
    this._gardenService.details()
      .subscribe(data => {
        if (data != null) {
          this.garden.id = data.id;
          this.garden.title = data.title;
          this.garden.width = parseInt(data.width);
          this.garden.length = parseInt(data.length);
          this.width = (parseInt(data.width) - 1) / 2;
          this.length = (parseInt(data.length) - 1) / 2;
          this.garden.longitude = data.longitude;
          this.garden.latitude = data.latitude;
          this.garden.soil = data.soil;
          this.garden.user = data.user;
          this.garden.countryCode = data.countryCode;
          this.garden.city = data.city;
          this.garden.plants = data.plants;

          this.inicializar();
          if(!this.mobile){
            this.listarPaises();
            this.mostrarCiudad();
            if (this.garden.city !== undefined) {
              this.getTiempo();
              this.getPrevision();
            }
          }
          
        }
      },
        error => {
          console.error(JSON.parse(error._body).Mensaje);
          if (JSON.parse(error._body).Mensaje == 'No existe') {
          } else {
            this._route.navigate(['/detail']);
          }

        });

  }

  getTiempo() {
    this._gardenService.tiempo(this.garden)
      .subscribe(data => {
        if (data.cod != '404') {
          this.haveWeather = true;
          var aux = data.main.temp - 273;
          this.temperatura = aux;
          var sunrise = new Date();
          var sunset = new Date();
          sunrise.setTime(data.sys.sunrise * 1000);
          this.sunrise = sunrise;

          sunset.setTime(data.sys.sunset * 1000);
          this.sunset = sunset;
        }
        else{
          this.haveWeather=false;
        }


      },
        error => {
          this.haveWeather=false;
          console.error(error);
          localStorage.clear();
          sessionStorage.clear();
          this._route.navigate(['/login']);
        });
  }

  getPrevision() {
    this._gardenService.prevision(this.garden)
      .subscribe(data => {
        if (data.cod != '404') {
          this.haveWeather = true;
          var date = new Date();
          var today = new Date();
          var todayDay = today.getDate();
          var auxToday = [];
          var auxTomorrow = [];
          var auxDia3 = [];
          var auxDia4 = [];
          var auxDia5 = [];
          for (var i = 0; i < data.list.length; i++) {
            date.setTime(data.list[i].dt * 1000);
            if (date.getDate() == todayDay) {
              auxToday.push(data.list[i]);
            }
            if (date.getDate() == todayDay + 1) {
              auxTomorrow.push(data.list[i]);
            }
            if (date.getDate() == todayDay + 2) {
              auxDia3.push(data.list[i]);

              this.nombreDia3 = this.diaSemana(date.getDay() - 1);
            }
            if (date.getDate() == todayDay + 3) {
              auxDia4.push(data.list[i]);
              this.nombreDia4 = this.diaSemana(date.getDay() - 1);
            }
            if (date.getDate() == todayDay + 4) {
              auxDia5.push(data.list[i]);
              this.nombreDia5 = this.diaSemana(date.getDay() - 1);
            }
          }
          this.prevHoy = auxToday;
          this.prevMan = auxTomorrow;
          this.prevDia3 = auxDia3;
          this.prevDia4 = auxDia4;
          this.prevDia5 = auxDia5;

          this.statusHoy = this.prevHoy[0].weather[0].main;
          this.statusMan = this.prevMan[4].weather[0].main;
          this.statusDia3 = this.prevDia3[4].weather[0].main;
          this.statusDia4 = this.prevDia4[4].weather[0].main;
          this.statusDia5 = this.prevDia5[4].weather[0].main;

          this.fotoHoy = this.prevHoy[0].weather[0].icon;
          this.fotoMan = this.prevMan[4].weather[0].icon;
          this.fotoDia3 = this.prevDia3[4].weather[0].icon;
          this.fotoDia4 = this.prevDia4[4].weather[0].icon;
          this.fotoDia5 = this.prevDia5[4].weather[0].icon;


          this.ordenarTemperatura();
        }
        else{
          this.haveWeather=false;
        }

      },
        error => {
          this.haveWeather=false;
          console.error(error);
        });
  }

  ordenarTemperatura() {
    var auxTemp: number[] = [];
    var auxNum = 0;
    for (var i = 0; i < this.prevMan.length; i++) {
      auxNum = this.prevMan[i].main.temp - 273;
      auxTemp.push(auxNum);
    }
    this.maxMan = Math.max(...auxTemp);
    this.minMan = Math.min(...auxTemp);

    this.colorMan = this.colorTemperatura(this.maxMan);
    auxTemp = [];
    auxNum = 0;

    for (var i = 0; i < this.prevDia3.length; i++) {
      auxNum = this.prevDia3[i].main.temp - 273;
      auxTemp.push(auxNum);
    }
    this.maxDia3 = Math.max(...auxTemp);
    this.minDia3 = Math.min(...auxTemp);
    this.colorDia3 = this.colorTemperatura(this.maxDia3);
    auxTemp = [];
    auxNum = 0;


    for (var i = 0; i < this.prevDia4.length; i++) {
      auxNum = this.prevDia4[i].main.temp - 273;
      auxTemp.push(auxNum);
    }
    this.maxDia4 = Math.max(...auxTemp);
    this.minDia4 = Math.min(...auxTemp);
    this.colorDia4 = this.colorTemperatura(this.maxDia4);
    auxTemp = [];
    auxNum = 0;

    for (var i = 0; i < this.prevDia5.length; i++) {
      auxNum = this.prevDia5[i].main.temp - 273;
      auxTemp.push(auxNum);
    }
    this.maxDia5 = Math.max(...auxTemp);
    this.minDia5 = Math.min(...auxTemp);
    this.colorDia5 = this.colorTemperatura(this.maxDia5);

    auxTemp = [];
    auxNum = 0;


  }

  colorTemperatura(temp) {
    var color = "#fcfcfc";
    if (temp < 10) {
      color = "#99c0ff"
    }
    if (temp >= 10 && temp <= 20) {
      color = "#ffee99"
    }
    if (temp > 20 && temp <= 30) {
      color = "#ffe45e"
    }
    if (temp > 30) {
      color = "#ff9999"
    }
    return color;
  }

  diaSemana(num) {
    var dia = "";
    if (num == -1) {
      num = 6;
    }
    switch (num % 7) {
      case 0:
        dia = "Lunes";
        break;
      case 1:
        dia = "Martes";
        break;
      case 2:
        dia = "Miércoles";
        break;
      case 3:
        dia = "Jueves";
        break;
      case 4:
        dia = "Viernes";
        break;
      case 5:
        dia = "Sábado";
        break;
      case 6:
        dia = "Domingo";
        break;
    }
    return dia;
  }


  edit() {

    this._gardenService.modifyGarden(this.garden, (this.width * 2) + 1, (this.length * 2) + 1)
      .subscribe(data => {
        this.ngOnInit();
      },
        error => {
          let v = JSON.parse(error._body);
          this._appComponent.mensajeEmergente(v.Mensaje, "danger", "");
        });
  }


  //country functions
  saveCountry(e) {
    if (e.value != 0 && e.value !== undefined) {
      this.garden.countryCode = e.value;
    }
  }

  saveCity(e) {
    if (e.value != 0 && e.value !== undefined) {
      this.garden.city = e.value;
      this.mostrarCiudad();
    }
  }

  openDialog(id: number, tipo: number) {
    let dialogRef = this.dialog.open(DialogHelpGardenComponent, {
      width: '600px'
    });
    
  }
  openDialog2(id: number, tipo: number){
    this._gardenService.getGardens()
    .subscribe(gardens=>{
      let dialogRef2 = this.dialog.open(DialogAllGardensComponent, {
        width: '600px', data: gardens
      });
    })
    
  }

  resizeCanvas() {
    let canvasEvolver = (<HTMLElement>document.querySelector('.canvasEvolver'));

    let canvas = document.querySelector('canvas');
    canvas.width = canvasEvolver.offsetWidth;
    canvas.height = canvasEvolver.offsetHeight;

    let desvX = (canvas.width - 1200) * 0.0008;
    let desvY = (canvas.height - 974) * 0.00072;
    let pos = motor.getPosCamaraActiva();
    //motor.moverCamaraA("camara2", 0, pos[1]+(-100*desvY), 0);
    motor.getCamaraActiva().entity.setParams(-1 - desvX, 1 + desvX, -0.7 - desvY, 0.7 + desvY, 1, 1000);


  }

  toggleState() {
    this.visible == 0 ? this.visible=1 : this.visible=0;
    document.getElementById('formulario').classList.add('infoOcult');
  }

  inicializar() {
    new iniciar("detail", this.garden, this.sunrise, this.sunset);
    let width = (<HTMLElement>document.querySelector(".canvasEvolver")).offsetWidth;
    let height = (<HTMLElement>document.querySelector(".canvasEvolver")).offsetHeight;
    let canvas = document.querySelector('canvas');
    canvas.width = width;
    canvas.height = height;

    let desvX = (canvas.width - 1200) * 0.0008;
    let desvY = (canvas.height - 974) * 0.00072;
    motor.getCamaraActiva().entity.setParams(-1 - desvX, 1 + desvX, -0.7 - desvY, 0.7 + desvY, 1, 1000);
    motor.moverCamaraA("camara2", 0, (100 * -desvY), 0);
    window.addEventListener("resize", this.resizeCanvas);
  }


  getMyStyles(temperatura, status) {
    let color1 = 'green';
    let color2 = 'blue';
    if (status == 'Clear') {
      color1 = '#fff600';
    } else if (status == 'Rain') {
      color1 = '#22dbed';
    } else if (status == 'Clouds') {
      color1 = '#e1e1e1';
    }
    if (temperatura < 0) {
      color2 = '#98daf4';
    } else if (temperatura < 10) {
      color2 = '#d6eff4';
    } else if (temperatura < 15) {
      color2 = '#eff2bb';
    } else if (temperatura < 20) {
      color2 = '#f5f289';
    } else if (temperatura < 25) {
      color2 = '#f8d44a';
    } else if (temperatura < 30) {
      color2 = '#f7b612';
    } else if (temperatura < 35) {
      color2 = '#f68b1f'
    } else {
      color2 = '#ea3c24';
    }
    let myStyles = {
      'background': 'linear-gradient(to top right, ' + color2 + ', ' + color1 + ')',
    };
    return myStyles;
  }

  isDragging() {
    return false;
  }

  //--------------------Mostrar Plantas---------------------//
  ActualizarPagina() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.paginaActual = params['pag'];
      this.getitems();
    });
  }

  getitems() {
    this._plantService.getNumberItems()
      .subscribe(data => {
        if (this.estado == false) {
          this.numeroItems = data[0].NUMPLANTAS;
        }
        this.mostrarplantasmotor();
      },
        error => {
          console.error(error);
        });
  }

  mostrarplantasmotor() {
    if (this.estado == false) {
      this._plantService.detailsAll(this.paginaActual, this.elementosPorPagina)
        .subscribe(data => {
          this.plantsmotor = [];
          for (let key$ in data) {
            this.plantsmotor.push(data[key$]);
          }
        },
          error => {
            console.error(error);
          });
    } else {
    }
  }

  //--------------------Detecta que es un nuevo usuarío y muestra tutorial---------------------//
  firstgarden() {
    this._gardenService.firstgarden()
      .subscribe(data => {
        if (data.Mensaje == "No existe") {
          this.dialog.open(DialogNewgarden0Component, { width: '60em', data: { id: 1 } });
        }
      },
        error => {
          console.error(JSON.parse(error._body).Mensaje);
        });
  }
    //--------------------Buscador---------------------//
    searchcontent(page: number, items: number) {
      this._plantService.searchAll(this.plant, page, items)
        .subscribe(data => {
          if (data[0] != undefined) {
            this.plantsmotor = [];
            this.numeroItems = data[0].num;
            if (this.estado == false) {
              this.paginaActual = 1;
              this.estado = true;
            }
            for (let key$ in data) {
              this.plantsmotor.push(data[key$]);
            }
          }else{
            this.plantsmotor = [];
            this.numeroItems = 0;
            this.paginaActual = 1;
          }
        },
        error => {
          console.error(error);
        });

    }
    

  ngOnInit() {
    if (typeof window.orientation !== 'undefined') { 
      this.mobile=true;
     }

    this.firstgarden();
    this.ActualizarPagina();
    this.accion = 'Editar';
    this.mostrar();
    new hammertime();
  }




}
