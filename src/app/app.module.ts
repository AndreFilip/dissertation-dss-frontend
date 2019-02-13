import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AppRoutingModule } from './/app-routing.module';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';
import { AreaInformationComponent } from './navigation/select-area/area-information/area-information.component';

import { PointserviceService } from './pointservice.service';
import { AreaInformationService } from './navigation/select-area/area-information/area-information.service';
import {JsonpModule, Jsonp, Response} from '@angular/http';
import { PolylineInformationComponent } from './navigation/select-area/polyline-information/polyline-information.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    WellcomePageComponent,
    SelectAreaComponent,
    AreaInformationComponent,
    PolylineInformationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    JsonpModule
  ],
  providers: [
    PointserviceService,
    AreaInformationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
