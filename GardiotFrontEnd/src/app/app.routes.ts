import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./components/manage/login.component";
import { LogoutComponent } from "./components/manage/logout.component";
import { RegisterComponent } from "./components/manage/register.component";
import { DetailComponent } from "./components/user/detail.component";
// import { ProfileComponent } from "./components/user/profile.component";
import { EditProfileComponent } from "./components/user/editprofile.component";
import { ConfirmationComponent } from "./components/manage/confirmation.component";
import { ResendComponent } from "./components/manage/resend.component";
import { CalendarComponent } from "./components/calendar/calendar.component";
//Plants
import { LibraryComponent } from "./components/plants/library/library.component";
import { PlantComponent } from "./components/plants/plant/plant.component";
//Users
import { NewuserComponent } from './components/users/newuser/newuser.component';
import { EdituserComponent } from './components/users/edituser/edituser.component';
import { AdminListUsersComponent } from './components/users/listusers/listusers.component';
//Oauth
import { OauthConfirmationComponent } from './components/manage/oauthconfirmation.component';
//Admin imports
import { AdminComponent } from './components/admin/admin.component';
//GardenComponent
import { GardenComponent } from './components/gardens/garden/garden.component';
import { AuthguardGuard } from "./authguard.guard";
//mas rutas
import { admin_routes } from "./admin.routes";
import { ResetPassComponent } from './components/manage/reset-pass.component';
import { ResetPassBackComponent } from './components/manage/reset-pass-back/reset-pass-back.component';
import { HelpComponent } from './components/help/help.component';
import { PrivacytermsComponent } from './components/privacyterms/privacyterms.component';
import { ApipageComponent } from './components/apipage/apipage.component';


const app_routes: Routes = [
  { path: 'resend', component: ResendComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'admin',  component: AdminComponent, children: admin_routes,canActivate: [AuthguardGuard] },//routerAdmin
  { path: 'detail', component: DetailComponent, canActivate: [AuthguardGuard] },
  // { path: 'profile', component: ProfileComponent, canActivate: [AuthguardGuard] },
  { path: 'editprofile', component: EditProfileComponent, canActivate: [AuthguardGuard] },
  { path: 'garden', component: GardenComponent, canActivate: [AuthguardGuard] },
  { path: 'plants', component: LibraryComponent, canActivate: [AuthguardGuard] },
  { path: 'plant/:id', component: PlantComponent, canActivate: [AuthguardGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthguardGuard] },
  { path: 'confirmation/:key', component: ConfirmationComponent },
  { path: 'oauthconfirmation/:key', component: OauthConfirmationComponent },
  { path: 'resetPass', component: ResetPassComponent },
  { path: 'reset-pass-back/:key', component: ResetPassBackComponent },
  { path: 'help', component: HelpComponent },
  { path: 'privacyterms', component: PrivacytermsComponent },
  { path: 'apipage', component: ApipageComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'detail' }
];

export const APP_ROUTING = RouterModule.forRoot(app_routes);
