export class WeatherObject {
    constructor(public long ? : number, public lat ? : number, public weatherMain ? : string, public weatherDesc ? : string, public weatherIcon ? : string, public temperature ? : number, public pressure ? : number,
         public humidity ? : number, public windSpeed ? : number, public windDeg ? : number, public clouds ? : number, public rain1 ? : number, public rain3 ? : number, 
         public snow1 ? : number, public snow3 ? : number, public dt ? : number, public sunrise ? : number, public sunset ? : number, public region ? : string) {}
}
