import { Color } from './color.model';

// Graphic is a better name
export class Point {

    title: string; 
    comments: string;
    latitude: number ; 
    longitude: number ; 
    color: Color ;
    paths: string ; 
    type: string ; 
    idReturned: number ;   
  
    constructor(title: string, comments: string, latitude: number , longitude: number , 
        color: Color, paths: string, type: string, idReturned: number) {
        this.title = title;
        this.comments = comments;
        this.latitude = latitude;
        this.longitude = longitude;
        this.color = color;    
        this.paths = paths;  
        this.type = type;    
        this.idReturned = idReturned;       
   
      }
}
