import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-edit-instruction',
  templateUrl: './edit-instruction.component.html',
  styleUrls: ['./edit-instruction.component.scss']
})
export class EditInstructionComponent implements OnInit {

  @Input() editedVal;
  @Output() updatedVal = new EventEmitter();

  alarmText: string;
  alarmType: string;

  eventText: string;
  eventType: string;

  sleep: string;

  selectedEditView: string;
  constructor() { }

  ngOnInit() {
    console.log(this.editedVal);
    if (this.editedVal.msmt.msgId === '200') {
      this.selectedEditView = 'msmts';
    } else if (this.editedVal.msmt.msgId.startsWith('40')) {
      this.selectedEditView = "event";
    } else if (this.editedVal.msmt.msgId.startsWith('30')) {
      this.selectedEditView = "alarm";
    } else {
      this.selectedEditView = "sleep";
    }
  }

  updateMsmt() {
    console.log(this.editedVal);
    this.updatedVal.emit(this.editedVal);
  }

}
