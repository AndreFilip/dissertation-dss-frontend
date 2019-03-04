import { Component, OnInit, Input } from '@angular/core';

import { WeatherObject } from './../../../../weatherObject.model';

import {AreaInformationService} from '../area-information.service';

@Component({
  selector: 'app-weather-template',
  templateUrl: './weather-template.component.html',
  styleUrls: ['./weather-template.component.css']
})
export class WeatherTemplateComponent implements OnInit {
  @Input('weatherObject') wo: WeatherObject;

  private imageUrl: string;
  private imageAlt: string;
  private iconUrl = 'http://openweathermap.org/img/w/'; 

  constructor(private areaInformationService:AreaInformationService) { }

  ngOnInit() {
    this.imageUrl = this.iconUrl + this.wo.weatherIcon + '.png';
    this.imageAlt = this.wo.weatherDesc;
  }

  getForecast() {
    this.areaInformationService.forecasts.next(true);
  }

  discardForecast() {
    this.areaInformationService.forecasts.next(false);
  }

}