import { Component, OnInit, Input } from '@angular/core';

import { AreaInformationService } from './area-information.service';

@Component({
  selector: 'app-area-information',
  templateUrl: './area-information.component.html',
  styleUrls: ['./area-information.component.css']
})
export class AreaInformationComponent implements OnInit {
  @Input() latitude: string;
  @Input() longitude: string;

  //service inject for weather
  constructor(private areaInformationService: AreaInformationService) { }

  ngOnInit() {
    this.initializeWeatherData();
  }

  initializeWeatherData() {
    this.areaInformationService.getWeatherData(this.latitude, this.longitude).subscribe((data) => 
      console.log(data)      
    );   
  }

  

}
