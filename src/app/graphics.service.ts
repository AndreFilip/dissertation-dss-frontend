import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Graphic } from './graphic.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class GraphicsService {

  private basicUrl = 'http://localhost:8080/graphics';

  constructor(private http: HttpClient) { }

  saveGraphics(graphics: Graphic[]): Observable<any> {
    return this.http.post<Graphic[]>(this.basicUrl, graphics, httpOptions);    
  } 

  getGraphics(): Observable<Graphic[]> {
    return this.http.get<Graphic[]>(this.basicUrl);    
  } 

  deleteGraphics(): Observable<any> {
    return this.http.delete(this.basicUrl);
  }

  deleteGraphic(id:number): Observable<any>  {
    return this.http.delete(this.basicUrl + "/" + id);
  }

  mapExists(): Observable<any>  {
    return this.http.get(this.basicUrl + "/mapExists");
  }
  

}
