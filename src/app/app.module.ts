import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './/app-routing.module';
import { JsonpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { CustomFormsModule } from 'ngx-custom-validators';

import { GraphicsService } from './graphics.service';
import { TokenStorageService } from './token-storage.service';
import { AuthService } from './auth.service';
import { AreaInformationService } from './navigation/select-area/area-information/area-information.service';
import { AuthGuard } from './auth.guard';

import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { WellcomePageComponent } from './wellcome-page/wellcome-page.component';
import { SelectAreaComponent } from './navigation/select-area/select-area.component';
import { AreaInformationComponent } from './navigation/select-area/area-information/area-information.component';
import { PolylineInformationComponent } from './navigation/select-area/polyline-information/polyline-information.component';
import { PolygonInformationComponent } from './navigation/select-area/polygon-information/polygon-information.component';
import { WeatherTemplateComponent } from './navigation/select-area/area-information/weather-template/weather-template.component';
import { WeatherTemplateForecastComponent } from './navigation/select-area/area-information/weather-template-forecast/weather-template-forecast.component';
import { SelectArea2Component } from './navigation/select-area2/select-area2.component';
import { SoilDataResultsComponent } from './navigation/select-area2/soil-data-results/soil-data-results.component';
import { ModalComponent } from './components/modal/modal.component';
import { LoginComponent } from './navigation/login/login.component';
import { SignupComponent } from './navigation/signup/signup.component';

import { httpInterceptorProviders } from './auth-interceptor';

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
    WeatherTemplateForecastComponent,
    SelectArea2Component,
    SoilDataResultsComponent,
    ModalComponent,
    LoginComponent,
    SignupComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    JsonpModule,
    NgbModule,
    FormsModule,
    CustomFormsModule
  ],
  providers: [
    GraphicsService,
    AreaInformationService,
    TokenStorageService,
    AuthService,
    httpInterceptorProviders,
    AuthGuard
  ],
  entryComponents: [
    ModalComponent    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
