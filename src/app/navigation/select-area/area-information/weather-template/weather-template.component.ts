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
  @Input() isIndexAvailable: boolean;


  private imageUrl: string;
  private imageAlt: string;
  private iconUrl = 'http://openweathermap.org/img/w/'; 
  private toggleBtn:boolean = false;

  constructor(private areaInformationService:AreaInformationService) { }

  ngOnInit() {
    this.imageUrl = this.iconUrl + this.wo.weatherIcon + '.png';
    this.imageAlt = this.wo.weatherDesc;
    this.areaInformationService.toggleForcastsBtn.subscribe( (toggleBtn) => { 
        this.toggleBtn = toggleBtn;        
    });
  }

  getForecast() {
    this.areaInformationService.forecasts.next({forecasts: true, isIndexAvailable: this.isIndexAvailable});
    this.areaInformationService.toggleForcastsBtn.next(true);
  }

  discardForecast() {
    this.areaInformationService.forecasts.next({forecasts: false, isIndexAvailable: this.isIndexAvailable});
    this.areaInformationService.toggleForcastsBtn.next(false);

  }

}