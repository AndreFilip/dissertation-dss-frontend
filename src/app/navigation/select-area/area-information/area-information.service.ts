import {
  Injectable
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  Observable
} from 'rxjs';
import {
  Jsonp
} from '@angular/http';

// ?lat={lat}&lon={lon}';
// fdf3690158d951e8c0031cb22966f666

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AreaInformationService {

  private basicUrl = 'http://api.openweathermap.org/data/2.5/weather';
  private myArcGisID = "&APPID=fdf3690158d951e8c0031cb22966f666";


  constructor(private http: HttpClient, private jsonp: Jsonp) {}

  getWeatherData(lat: string, lon: string) {
    return this.http.get(this.basicUrl + "?" + "lat=" + lat + "&lon=" + lon + this.myArcGisID);
  }

  getLengthOfPolyline(url: string) {
    return this.jsonp.request(url + "&callback=JSONP_CALLBACK");
  }

}