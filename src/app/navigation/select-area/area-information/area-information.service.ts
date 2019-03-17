import {  Injectable} from '@angular/core';
import {  HttpClient,  HttpHeaders} from '@angular/common/http';
import {  Subject} from 'rxjs';
import {  Jsonp} from '@angular/http';
import { Soil } from '../../../soil.model'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AreaInformationService {
  forecasts = new Subject<boolean>();

  private myID = "&appid=fdf3690158d951e8c0031cb22966f666";
  
  private weatherDataURL = 'http://api.openweathermap.org/data/2.5/weather';
  private weatherForecastDataURL = 'http://api.openweathermap.org/data/2.5/forecast';
  private soilDataURL = 'https://rest.soilgrids.org/query?';
  private mySoilResultsURL = '';


  constructor(private http: HttpClient, private jsonp: Jsonp) {}

  getWeatherData(lat: string, lon: string) {
    return this.http.get(this.weatherDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  } 

  getWeatherForecastData(lat: string, lon: string) {
    return this.http.get(this.weatherForecastDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  }

  getLengthOfPolyline(url: string) {
    return this.jsonp.request(url + "&callback=JSONP_CALLBACK");
  }

  getSoilData(lat, lon, depths) {    
    return this.http.get(this.soilDataURL + "lat=" + lat + "&lon=" + lon + "&depths=" + depths); 
  }  

  getSoilResults(soil: Soil) {
    // console.log(soil);    
    // return this.http.post<any>(this.mySoilResultsURL, soil, httpOptions); 
  }
 
}



  // private describeUrl = 'https://rest.soilgrids.org/query/describe';  
  // private airQualityCO = 'http://api.openweathermap.org/pollution/v1/co/'; 
  // private airQualityNO2 = 'http://api.openweathermap.org/pollution/v1/no2/';
  // private airQualityO3 = 'http://api.openweathermap.org/pollution/v1/o3/';
  // private airQualitySO2 = 'http://api.openweathermap.org/pollution/v1/so2/';
  // private airEnd = '.json?appid=fdf3690158d951e8c0031cb22966f666';