import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreaInformationService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private basicUrl = 'http://api.openweathermap.org/data/2.5/weather';
  private myArcGisID = "&APPID=fdf3690158d951e8c0031cb22966f666";
  // ?lat={lat}&lon={lon}';

  // fdf3690158d951e8c0031cb22966f666

  constructor(private http: HttpClient) { }

  getWeatherData(lat: string , lon: string){
    return this.http.get(this.basicUrl + "?" + "lat=" + lat + "&lon=" + lon + this.myArcGisID);
    }

  getConvertedPathTo4326(url: string){
  return this.http.get(url);
  }

}
