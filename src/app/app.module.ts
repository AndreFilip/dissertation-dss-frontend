import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AppRoutingModule } from './/app-routing.module';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';

import { PointserviceService } from './pointservice.service';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    WellcomePageComponent,
    SelectAreaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    PointserviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
