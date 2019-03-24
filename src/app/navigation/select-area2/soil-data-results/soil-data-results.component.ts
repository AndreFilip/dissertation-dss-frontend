import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-soil-data-results',
  templateUrl: './soil-data-results.component.html',
  styleUrls: ['./soil-data-results.component.css']
})
export class SoilDataResultsComponent implements OnInit {
  urlSoilTexture: string;
  urlbulk: string;
  urlCarbon: string;
  urlCec: string;
  urlPh: string;

  @Input('soilDataResults') soilDataResults: any;

  constructor() { }

  ngOnInit() {
    this.urlSoilTexture = "../../../assets/soil_texture.jpg";
    this.urlbulk = "../../../assets/bulk.jpg";
    this.urlCarbon = "../../../assets/carbon.png";
    this.urlCec = "../../../assets/cec.png";
    this.urlPh = "../../../assets/ph.png";
    this.soilDataResults.soilTextureClassList = ["adsa", "asdsdas"];
  }

}
