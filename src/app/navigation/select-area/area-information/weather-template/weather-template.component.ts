import { Component, OnInit, Input } from '@angular/core';

import { WeatherObject } from './../../../../weatherObject.model'

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

  constructor() { }

  ngOnInit() {
    //console.log(this.wo);    
    this.imageUrl = this.iconUrl + this.wo.weatherIcon + '.png';
    this.imageAlt = this.wo.weatherDesc;
  }

}

// constructor(public long ? : number, public lat ? : number, public weatherMain ? : string, public weatherDesc ? : string, public weatherIcon ? : string, 
//   public temperature ? : number, public pressure ? : number, public humidity ? : number, public windSpeed ? : number, public windDeg ? : number, public clouds ? : number,
//       public rain1 ? : number, public rain3 ? : number, public snow1 ? : number, public snow3 ? : number, public dt ? : number, public sunrise ? : number, public sunset ? : number,
//        public region ? : string) {}