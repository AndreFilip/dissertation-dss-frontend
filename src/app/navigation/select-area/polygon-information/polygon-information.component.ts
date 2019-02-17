import {
  Component,
  OnInit,
  Input
} from '@angular/core';

@Component({
  selector: 'app-polygon-information',
  templateUrl: './polygon-information.component.html',
  styleUrls: ['./polygon-information.component.css']
})
export class PolygonInformationComponent implements OnInit {
  @Input() area: number;
  @Input() areaIndex: string;

  constructor() {}

  ngOnInit() {}

}