import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./components/users/login.component";
import { LogoutComponent } from "./components/users/logout.component";
import { RegisterComponent } from "./components/users/register.component";
import { DetailComponent } from "./components/users/detail.component";


const app_routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'detail', component: DetailComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'detail' }
];

export const APP_ROUTING = RouterModule.forRoot(app_routes);
