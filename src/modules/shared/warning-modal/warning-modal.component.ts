import { Component, Input, OnInit } from '@angular/core';
import { Modal } from '../models/modal.model';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss']
})
export class WarningModalComponent implements OnInit {
  @Input() modal:Modal;

  constructor() { }

  ngOnInit() {
  }

}
