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

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



}
