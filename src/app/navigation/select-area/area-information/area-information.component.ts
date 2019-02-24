import {
  Component,
  OnInit,
  Input
} from '@angular/core';

import {
  AreaInformationService
} from './area-information.service';

import { WeatherObject } from './../../../weatherObject.model'

@Component({
  selector: 'app-area-information',
  templateUrl: './area-information.component.html',
  styleUrls: ['./area-information.component.css']
})
export class AreaInformationComponent implements OnInit {
  @Input() latitude: string;
  @Input() longitude: string;
  @Input() selectedGraphic: string;
  @Input() type: string; 

  private errors = [];
  private wo: WeatherObject;

  constructor(private areaInformationService: AreaInformationService) {}

  ngOnInit() {
    this.initializeWeatherData(this.latitude, this.longitude);    
    this.latitude = this.roundTo2Decimals(this.latitude).toString();
    this.longitude = this.roundTo2Decimals(this.longitude).toString();    
  }

  initializeWeatherData(lat, lon) {
    this.areaInformationService.getWeatherData(lat, lon).subscribe((response) => {
      //console.log(response);
      let data = (<any>response);
      if(data.rain) {
        var rain1 = data.rain['1h'] ? data.rain['1h']: undefined;
        var rain3 = data.rain['3h'] ? data.rain['3h']: undefined;
      }
      if(data.snow) {
        var snow1 = data.snow['1h'] ? data.snow['1h']: undefined;
        var snow3 = data.snow['3h'] ? data.snow['3h']: undefined;
      }
      this.wo = new WeatherObject(data.coord.lon, data.coord.lat, data.weather[0].main, data.weather[0].description, data.weather[0].icon, data.main.temp, data.main.pressure, data.main.humidity,
        data.wind.speed, data.wind.deg, data.clouds.all, rain1, rain3, snow1, snow3, data.dt , data.sys.sunrise, data.sys.sunset, data.name ); 
        
    }, error => {
      //console.log(error);
      this.errors.push["An error occured during gathering data."];
    });
  }



  roundTo6Decimals(num) {
    return Math.round(num * 1000000) / 1000000;
  }

  roundTo10Decimals(num) {
    return Math.round(num * 10000000000) / 10000000000;
  }

  roundTo2Decimals(num) {
    return Math.round(num * 100) / 100;
  }

  roundTo3Decimals(num) {
    return Math.round(num * 1000) / 1000;
  }

}
