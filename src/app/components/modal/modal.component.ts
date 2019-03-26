import { Component, OnInit, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() result: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.closeItAfterSomeSeconds();
  }

  closeItAfterSomeSeconds() {
    setTimeout( () => {
      this.activeModal.close();
    }, 2000);
  }

}
