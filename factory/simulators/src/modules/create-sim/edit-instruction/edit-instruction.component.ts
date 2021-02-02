import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-instruction',
  templateUrl: './edit-instruction.component.html',
  styleUrls: ['./edit-instruction.component.scss']
})
export class EditInstructionComponent implements OnInit {

  @Input() editedVal;  

  alarmText: string;
  alarmType: string;

  eventText: string;
  eventType: string;

  sleep: string;

  selectedEditView: string;
  constructor() { }

  ngOnInit() {
    console.log(this.editedVal);
    if (this.editedVal.msgId === '200') {
      this.selectedEditView = 'msmts';
    } else if (this.editedVal.msgId.startsWith('40')) {
      this.selectedEditView = "event";
    } else if (this.editedVal.msgId.startsWith('30')) {
      this.selectedEditView = "alarm";
    } else {
      this.selectedEditView = "sleep";
    }
  }

}
