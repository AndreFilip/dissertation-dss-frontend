import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AreaInformationService } from '../select-area/area-information/area-information.service';

import { Soil } from '../../soil.model'

@Component({
  selector: 'app-select-area2',
  templateUrl: './select-area2.component.html',
  styleUrls: ['./select-area2.component.css']
})
export class SelectArea2Component implements OnInit {
  errormsg = null;
  soilDataResults: {} = null;

  private myModel: any = {
    latitude: undefined, 
    longitude: undefined,
    carbon: undefined,
    bulk: undefined,
    ph: undefined,
    cation: undefined,
    silt: undefined,
    clay: undefined,
    sand: undefined
  };

  constructor(private router: Router, private route: ActivatedRoute, private areaInformationService: AreaInformationService) { }

  ngOnInit() {   
    this.route.url.subscribe((url: UrlSegment[]) => {     
      let coords = url[0];
      this.myModel.latitude = coords.parameters.lat;
      this.myModel.longitude = coords.parameters.long;
      if(this.myModel.longitude&&this.myModel.longitude) {
        this.getSoilData();
      }
    });
  
  }

  getSoilResults() {
    let soil = new Soil(this.myModel.carbon, this.myModel.bulk, this.myModel.ph, this.myModel.cation, this.myModel.silt, this.myModel.clay, this.myModel.sand);
    this.areaInformationService.getSoilResults(soil).subscribe( (results => {
      console.log(results);
      this.soilDataResults = results;
    }), error => {
      console.log(error);
    });
  }

  getSoilData() {
    this.areaInformationService.getSoilData(this.myModel.latitude, this.myModel.longitude, "sl2").subscribe( (response) => {
      console.log(response);
      let results = <any> response;
      if(results && results.properties && results.properties.soilmask && results.properties.soilmask == "soil") {
        let properties = results.properties;
        // ORCDRC carbon
        this.myModel.carbon = properties.ORCDRC.M.sl2;
        // BLDFIE bulk
        this.myModel.bulk = properties.BLDFIE.M.sl2 / 1000;
        // PHIHOX ph
        this.myModel.ph = properties.PHIHOX.M.sl2 / 10;
        // CECSOL cation
        this.myModel.cation = properties.CECSOL.M.sl2;
        // SLTPPT silt
        this.myModel.silt = properties.SLTPPT.M.sl2;
        // CLYPPT clay
        this.myModel.clay = properties.CLYPPT.M.sl2;
        // SNDPPT clay
        this.myModel.sand = properties.SNDPPT.M.sl2;
      } else if (results && results.properties && results.properties.soilmask && results.properties.soilmask != "soil") { 
        this.errormsg = "The coordinates indicate no soil.";
      } else {
        this.errormsg = "Sorry. Something went wrong and data cannot be extracted for now.";
      }
    }, (error) => {      
      console.log(error);
    });
  }

}