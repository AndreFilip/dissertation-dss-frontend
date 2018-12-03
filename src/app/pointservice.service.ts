import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Color } from './color.model';
import { Point } from './point.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class PointserviceService {

  private basicUrl = 'http://localhost:8080/graphics';

  constructor(private http: HttpClient) { }

  saveGraphics(points: Point[]): any {
    return this.http.post<any>(this.basicUrl, JSON.stringify(points), httpOptions);    
  } 

  getGraphics(): Observable<Point[]> {
    return this.http.get<Point[]>(this.basicUrl);    
  } 

  deleteGraphics() {
    return this.http.delete(this.basicUrl);
  }

  deleteGraphic(id) {
    return this.http.delete(this.basicUrl + "/" + id);
  }
  

}
