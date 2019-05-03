import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  Router
} from "@angular/router"

import {
  AreaInformationService
} from './area-information.service';

import {
  WeatherObject
} from './../../../weatherObject.model'

@Component({
  selector: 'app-area-information',
  templateUrl: './area-information.component.html',
  styleUrls: ['./area-information.component.css']
})
export class AreaInformationComponent implements OnInit, OnChanges {
  @Input() latitude: string;
  @Input() longitude: string;
  @Input() selectedGraphic: string;
  @Input() type: string;

  private errors = [];
  private wo: WeatherObject;
  private isIndexAvailable: boolean;

  constructor(private areaInformationService: AreaInformationService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.latitude.firstChange || !changes.longitude.firstChange) {      
      this.initializeWeatherData(this.latitude, this.longitude);     
      this.latitude = this.roundTo2Decimals(this.latitude).toString();
      this.longitude = this.roundTo2Decimals(this.longitude).toString(); 
    }
  }

  ngOnInit() {
    this.initializeWeatherData(this.latitude, this.longitude);
    this.latitude = this.roundTo2Decimals(this.latitude).toString();
    this.longitude = this.roundTo2Decimals(this.longitude).toString();
  }

  goToSoilData() {
    this.router.navigate(['/select-area-2', {
      lat: this.latitude,
      long: this.longitude
    }]);
  }

  initializeWeatherData(lat, lon) {
    this.areaInformationService.getWeatherData(lat, lon).subscribe((response) => {
      let data = ( < any > response);
      if (data.rain) {
        var rain1 = data.rain['1h'] ? data.rain['1h'] : undefined;
        var rain3 = data.rain['3h'] ? data.rain['3h'] : undefined;
      }
      if (data.snow) {
        var snow1 = data.snow['1h'] ? data.snow['1h'] : undefined;
        var snow3 = data.snow['3h'] ? data.snow['3h'] : undefined;
      }
      this.wo = new WeatherObject(data.coord.lon, data.coord.lat, data.weather[0].main, data.weather[0].description, data.weather[0].icon, data.main.temp, data.main.pressure, data.main.humidity,
        data.wind.speed, data.wind.deg, data.clouds.all, rain1, rain3, snow1, snow3, data.dt, data.sys.sunrise, data.sys.sunset, data.name);
        this.checkIfIsLandAndBringFireIndex();
      }, error => {
      console.log(error);
      this.errors.push["An error occured during gathering data."];
    });
  }

  getFireIndex() {
    let temp = this.wo.temperature;
    let rhum = this.wo.humidity;
    let wind = this.wo.windSpeed;
    let prcp = 0;
    if (this.wo.rain1) {
      prcp = this.wo.rain1;
    } else if (this.wo.rain3) {
      prcp = this.wo.rain3;
    }
    let mth = new Date().getMonth() + 1;
    let data = {
      temp: temp,
      rhum: rhum,
      wind: wind,
      prcp: prcp,
      mth: mth
    };
    this.areaInformationService.getFireIndex(data).subscribe((results) => {
      console.log(results);
      let index = this.roundTo2Decimals(results);
      if (index) {
        this.areaInformationService.fireIndexObservable.next(index);
      } else {
        this.areaInformationService.fireIndexObservable.next(-1);
      }
    }, error => {
      console.log("Error in getHistoryRainResults(): ", error);
    });
  }

  checkIfIsLandAndBringFireIndex() {
    this.areaInformationService.getSoilData(this.latitude, this.longitude, "sl2").subscribe((response) => {
      console.log(response);
      let results = < any > response;
      if (results && results.properties && results.properties.soilmask && (results.properties.soilmask == "water" || results.properties.soilmask == "nodata")) {
        this.areaInformationService.fireIndexObservable.next(-1);
        this.isIndexAvailable = false;
      } else if (results && results.properties && results.properties.soilmask && (results.properties.soilmask == "soil" || results.properties.soilmask == "urban")) {
        this.getFireIndex();
        this.isIndexAvailable = true;
      }
    }, (error) => {
      console.log(error);
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

