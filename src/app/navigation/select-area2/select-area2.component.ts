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
    }));
  }

  logForm(form: NgForm) {
    console.log(form);
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

// www.soilquality.org
// https://www.dpi.nsw.gov.au
// https://extension.psu.edu/introduction-to-soils-soil-quality

// ORCDRC	Soil organic carbon content	g/kg
// Soil organic carbon content ORCDRC Function of Soils for Human Societies and the Environment
// SOC thresohld = 0.87 + 0.32 (A+L)
// 80%sand -> 7.3 g/kg
// 0-10cm

// BLDFIE	Bulk density (fine earth)	kg/m3
// Soils with a bulk density higher than 1.6 g/cm3 tend to restrict root growth.
// Bulk density increases with compaction and tends to increase with depth.
// Sandy soils are more prone to high bulk density

// PHIHOX	pH index measured in water solution	pH
// pH Soil pH in the range of 5.5 to 7.5 is optimal for growing crops  - 6.2 and 6.8

// CECSOL	Cation Exchange Capacity of soilcmolc/kg  centimoles of charge per kilogram
// . A figure above 10 cmol(+)/kg is preferred for plant production. 
// Soils with high levels of swelling clay and organic matter can have a CEC of 30 cmol(+)/kg or more.
// Cation exchange capacity (CEC) is the total capacity of a soil to hold exchangeable cations.---
// CEC is an inherent soil characteristic and is difficult to alter significantly.---
// It influences the soil’s ability to hold onto essential nutrients and provides a buffer against soil acidification.---
// Soils with a higher clay fraction tend to have a higher CEC.
// Organic matter has a very high CEC.
// Sandy soils rely heavily on the high CEC of organic matter for the retention of nutrients in the topsoil.---

// CRFVOL	Volumetric percentage of coarse fragments (>2 mm)	percentage
// SNDPPT	Weight percentage of the sand particles (0.05–2 mm)	percentage
// SLTPPT	Weight percentage of the silt particles (0.0002–0.05 mm)	percentage
// CLYPPT	Weight percentage of the clay particles (<0.0002 mm)	percentage


// Sand: Sand soil is best for root based vegetables like turnips, parsnips, and carrots.




// Loam : This type of soil helps grow the best possible crops because it provides the necessary elements.

// Clay: This type of soil is best for growing Cabbage and broccoli and is not considered good for root vegetables. Because of its dense texture it creates problems for roots to expand.



// Silt: It is very fertile soil that has nutrients for good development. Lettuce, cabbage, carrots, turnips, and many other vegetables flourish in silt.

// Peat: This type of soil is best in case of growing Legumes, root crops, cabbage, and spinach.

