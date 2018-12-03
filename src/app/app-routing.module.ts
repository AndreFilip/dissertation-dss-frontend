import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';


const routes: Routes = [
  { path: '', redirectTo: '/welcome-page', pathMatch: 'full' },
  { path: 'welcome-page', component: WellcomePageComponent },
  { path: 'select-area', component: SelectAreaComponent }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})



export class AppRoutingModule {}