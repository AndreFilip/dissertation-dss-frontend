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
  forecasts = new Subject<{forecasts:boolean, isIndexAvailable: boolean}>();
  toggleForcastsBtn = new Subject<boolean>();
  fireIndexObservable = new Subject<number>();


  private DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

  private myID = "&appid=fdf3690158d951e8c0031cb22966f666";
  private apixuID = "&appid=b296c4beb89f4875b05164715193103";

     
  private weatherDataURL = 'https://api.openweathermap.org/data/2.5/weather';
  private weatherForecastDataURL = 'https://api.openweathermap.org/data/2.5/forecast';
  private soilDataURL = 'https://rest.soilgrids.org/query?';
  // private mySoilResultsURL = 'http://localhost:8080/soildata';
  // private myFireDataResultsURL = 'http://localhost:8080/firedata'
  private mySoilResultsURL = 'https://mydssathenstech.herokuapp.com/soildata';
  private myFireDataResultsURL = 'https://mydssathenstech.herokuapp.com/firedata'

  constructor(private http: HttpClient, private jsonp: Jsonp) {}

  getWeatherData(lat: string, lon: string) {
    return this.http.get(this.weatherDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  } 

  getWeatherForecastData(lat: string, lon: string) {
    return this.http.get(this.weatherForecastDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  }

  getLengthOfPolyline(url: string) {
    return this.http.get(url);
  }

  getSoilData(lat, lon, depths) {    
    return this.http.get(this.soilDataURL + "lat=" + lat + "&lon=" + lon + "&depths=" + depths); 
  }  

  getSoilResults(soil: Soil) {
    return this.http.post<Soil>(this.mySoilResultsURL, soil, httpOptions); 
  }

  getFireIndex(data: any) {
    return this.http.post(this.myFireDataResultsURL, data ,httpOptions); 
  }
 
}
