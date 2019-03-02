import { Component, OnInit,Input } from '@angular/core';

import { WeatherObject } from './../../../../weatherObject.model'

@Component({
  selector: 'app-weather-template-forecast',
  templateUrl: './weather-template-forecast.component.html',
  styleUrls: ['./weather-template-forecast.component.css']
})
export class WeatherTemplateForecastComponent implements OnInit {
  @Input() wo: any;

  private imageUrl: string;
  private imageAlt: string;
  private iconUrl = 'http://openweathermap.org/img/w/'; 

  constructor() { }

  ngOnInit() {    
    // console.log(this.wo);
    if (this.wo.weather[0].icon) {
      this.imageUrl = this.iconUrl + this.wo.weather[0].icon + '.png';
    } else {
      this.imageUrl = this.iconUrl + '01d.png';
    }
    if (this.wo.weather[0].description) {
      this.imageAlt = this.wo.weather[0].description;
    } else {
      this.imageAlt = "did not fetch description";
    }
  }

}
