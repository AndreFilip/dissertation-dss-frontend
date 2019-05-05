import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';
import { SelectArea2Component } from './navigation/select-area2/select-area2.component';
import { LoginComponent } from './navigation/login/login.component';
import { SignupComponent } from './navigation/signup/signup.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/welcome-page', pathMatch: 'full' },
  { path: 'welcome-page', component: WellcomePageComponent },
  { path: 'select-area', component: SelectAreaComponent, canActivate: [AuthGuard]},
  { path: 'select-area-2', component: SelectArea2Component, canActivate: [AuthGuard] },
  { path: 'log-in', component: LoginComponent },
  { path: 'sign-up', component: SignupComponent },
  { path: '**', redirectTo: '/welcome-page', pathMatch: 'full' }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})



export class AppRoutingModule {}