import { Component, OnInit,Input, OnChanges, SimpleChanges} from '@angular/core';

import {  AreaInformationService} from '../../area-information/area-information.service';

@Component({
  selector: 'app-weather-template-forecast',
  templateUrl: './weather-template-forecast.component.html',
  styleUrls: ['./weather-template-forecast.component.css']
})
export class WeatherTemplateForecastComponent implements OnInit, OnChanges {
  @Input() private wo: any;
  @Input() private isIndexAvailable;

  private imageUrl: string;
  private imageAlt: string;
  private iconUrl = 'http://openweathermap.org/img/w/'; 
  private index: number;

  constructor(private areaInformationService: AreaInformationService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    
  }

  ngOnInit() {    
    console.log(this.wo);
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
    this.getFireIndex();
  }

  getFireIndex() {
    let temp = this.wo.main.temp;
    let rhum = this.wo.main.humidity;
    let wind = this.wo.wind.speed;
    let prcp = 0;
    if (this.wo.rain && this.wo.rain['3h']) {
      prcp = this.wo.rain['3h'];
    }
    let dateInUTM =  this.wo.dt * 1000;
    let mth = new Date(dateInUTM).getMonth() + 1;
    let data = {
      temp: temp,
      rhum: rhum,
      wind: wind,
      prcp: prcp,
      mth: mth
    };
    console.log(data);
    this.areaInformationService.getFireIndex(data).subscribe((results) => {
      console.log(results);
      this.index = this.roundTo2Decimals(results);     
    }, error => {
      console.log("Error in getFireIndex(): ", error);
    });
  }

  roundTo2Decimals(num) {
    return Math.round(num * 100) / 100;
  }

}
