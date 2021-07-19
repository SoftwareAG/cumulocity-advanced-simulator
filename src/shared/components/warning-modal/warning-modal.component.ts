import { Component, Input } from '@angular/core';
import { Modal } from '@models/modal.model';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss']
})
export class WarningModalComponent {
  @Input() modal: Modal;

  constructor() {}
}
