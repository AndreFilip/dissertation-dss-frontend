import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-polyline-information',
  templateUrl: './polyline-information.component.html',
  styleUrls: ['./polyline-information.component.css']
})
export class PolylineInformationComponent implements OnInit {
  @Input() polylineLength: string;

  constructor() { }

  ngOnInit() {
    
  }

}
