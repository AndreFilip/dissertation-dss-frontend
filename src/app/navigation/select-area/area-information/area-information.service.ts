import {
  Injectable
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  Observable, Subject
} from 'rxjs';
import {
  Jsonp
} from '@angular/http';

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
  private weatherDorecastDataURL = 'http://api.openweathermap.org/data/2.5/forecast';


  constructor(private http: HttpClient, private jsonp: Jsonp) {}

  getWeatherData(lat: string, lon: string) {
    return this.http.get(this.weatherDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  } 

  getWeatherForecastData(lat: string, lon: string) {
    return this.http.get(this.weatherDorecastDataURL + "?" + "lat=" + lat + "&lon=" + lon + "&units=metric" + this.myID);
  }

  getLengthOfPolyline(url: string) {
    return this.jsonp.request(url + "&callback=JSONP_CALLBACK");
  }

}