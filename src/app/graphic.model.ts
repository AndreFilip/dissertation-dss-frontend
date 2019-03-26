import { Color } from './color.model';

export class Graphic { 
  
    constructor(public id: number, public title: string, public comments: string, public latitude: number , public longitude: number , 
      public color: Color, public paths: string, public type: string) { }
}
