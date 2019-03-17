import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';
import { SelectArea2Component } from './navigation/select-area2/select-area2.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome-page', pathMatch: 'full' },
  { path: 'welcome-page', component: WellcomePageComponent },
  { path: 'select-area', component: SelectAreaComponent },
  { path: 'select-area-2', component: SelectArea2Component }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})



export class AppRoutingModule {}