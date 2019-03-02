import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './/app-routing.module';
import { JsonpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';
import { AreaInformationComponent } from './navigation/select-area/area-information/area-information.component';
import { PolylineInformationComponent } from './navigation/select-area/polyline-information/polyline-information.component';
import { PolygonInformationComponent } from './navigation/select-area/polygon-information/polygon-information.component';
import { WeatherTemplateComponent } from './navigation/select-area/area-information/weather-template/weather-template.component';
import { WeatherTemplateForecastComponent } from './navigation/select-area/area-information/weather-template-forecast/weather-template-forecast.component';

import { PointserviceService } from './pointservice.service';
import { AreaInformationService } from './navigation/select-area/area-information/area-information.service';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    WellcomePageComponent,
    SelectAreaComponent,
    AreaInformationComponent,
    PolylineInformationComponent,
    PolygonInformationComponent,
    WeatherTemplateComponent,
    WeatherTemplateForecastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    JsonpModule,
    NgbModule
  ],
  providers: [
    PointserviceService,
    AreaInformationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
