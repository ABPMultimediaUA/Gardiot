import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TaskService } from "../../services/task.service";
import { Task } from "../../classes/task.class";
import { Treatment } from "../../classes/treatment.class";
import { AppComponent } from "../../app.component";
import { RouterLink, ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DialogTaskComponent } from './dialog-task/dialog-task.component';
import { MatDialog } from '@angular/material';
import {
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { Subject } from 'rxjs/Subject';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarDateFormatter,
  DAYS_OF_WEEK
} from 'angular-calendar';
import { CustomDateFormatter } from './customdate.provider';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  },
  green: {
    primary: '#009900',
    secondary: '#99ff99'
  }
};

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['calendar.component.css'],
  templateUrl: 'calendar.component.html',
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})
export class CalendarComponent implements OnInit {

  view: string = 'month';
  viewDate: Date = new Date();

  locale: string = 'es';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  private tasks: any[] = [];
  private task = new Task();

  private treatments: any[] = [];
  private treatment = new Task();






  actions: CalendarEventAction[] = [
    /*{
      label: '<i class="fa fa-fw fa-pencil">Detalles</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
      this.handleEvent('Edited', event);
      }
    },*/
    {
      label: '<i class="material-icons">check</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        //this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Done', event, undefined);
      }
    }/*,
    {
      label: '<i class="material-icons">close</i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Done', event);
      }
    }*/
  ];
  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    /*{
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'Fumigar las margaritas',
      color: colors.red,
      actions: this.actions
    },
    {
      start: startOfDay(new Date()),
      title: 'Podar el olivo',
      color: colors.yellow,
      actions: this.actions
    },
    {
      start: startOfDay(new Date('2018-04-15')),
      title: 'tarta espacial',
      color: colors.yellow,
      actions: this.actions
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'Próxima poda de los almendros',
      color: colors.blue
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: new Date(),
      title: 'Fumigar las rosas',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true
    }*/
  ];

  activeDayIsOpen: boolean = true;

  constructor(
    private _taskService: TaskService,
    private _route: Router,
    private _appComponent: AppComponent,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) { }


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    let oldDate = this.datePipe.transform(event.start.toString(), 'yyyy-MM-dd');
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Changed', event, oldDate);
    this.refresh.next();
  }


  addEvent(Ttitle: string, Tstart: string, Tend: string, idT: number, done: boolean): void {
    let color;
    ;

    done ? color=colors.green : (Ttitle.indexOf('Regar')>=0 ? color=colors.blue : color=colors.red);


    this.events.push({
      title: Ttitle,
      id: idT,
      start: startOfDay(new Date(Tstart)),
      end: endOfDay(new Date(Tend)),
      color: color,
      actions: this.actions,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
    this.refresh.next();

  }

  handleEvent(action:string, event:CalendarEvent, oldDate:string) {
    let f = new Date();
    let fecha_actual: string;
    f.getDate();
    f.getMonth() + 1;
    f.getFullYear();
    fecha_actual = this.datePipe.transform(f, 'yyyy-MM-dd');

    if(action=='Edited'){
      console.log('deberias saltar el pop up');
      this.dialog.open(DialogTaskComponent, { width: '800px', data: {id: 1}});

    }
    else if(action=='Done'){
      event.color = colors.green;
      this.refresh.next();
      let task=this.tasks[event.id];
      this._taskService.DoneTask(task.mPlant, task.myPlant, task.tPlant, task.treatmentPlant, this.datePipe.transform(event.start.toString(), 'yyyy-MM-dd'), fecha_actual )
        .subscribe(data => {
          console.log(data);
        });

    }
    else if(action=='Changed'){
      console.log(oldDate);
      let task=this.tasks[event.id];
      this._taskService.moveTask(task.mPlant, task.myPlant, task.tPlant, task.treatmentPlant, oldDate, this.datePipe.transform(event.start.toString(), 'yyyy-MM-dd'))
        .subscribe(data => {
          console.log(data);
        });
    }
    else{
      // alert("click standar");
      let task=this.tasks[event.id];
      // llamada pop Up
      this.dialog.open(DialogTaskComponent, { width: '800px', data: {mPlant: task.mPlant,myPlant:task.myPlant,tPlant:task.tPlant,treatmentPlant:task.treatmentPlant}});
    }

  }

  mostrar() {
    let f = new Date();
    let fecha_actual: string;
    f.getDate();
    f.getMonth() + 1;
    f.getFullYear();
    fecha_actual = this.datePipe.transform(f, 'yyyy-MM-dd');
    this._taskService.detailsAll(fecha_actual)
      .subscribe(data => {
        this.tasks = [];
        for (let key$ in data) {
          this.tasks.push(data[key$]);
          // console.log(data[key$]);
          this.addEvent(data[key$].name + " " + data[key$].commonName,
                        this.datePipe.transform(data[key$].date, 'yyyy-MM-dd'),
                        this.datePipe.transform(data[key$].date, 'yyyy-MM-dd'),
                        parseInt(key$),
                        data[key$].dateDone!=null);
        }
        /*for(let key$ in data){
          this.treatments.push(data[key$]);
        }
        console.log(this.treatments);
        console.log(this.tasks);*/
      },
      error => {
        console.error(error);
      });
  }

  ngOnInit() {
    this.mostrar();
  }
}
