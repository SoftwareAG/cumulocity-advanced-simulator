import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-instruction',
  templateUrl: './edit-instruction.component.html',
  styleUrls: ['./edit-instruction.component.scss']
})
export class EditInstructionComponent implements OnInit {

  @Input() editMsmt;  
  @Input() editAlarm;

  alarmText: string;
  alarmType: string;

  eventText: string;
  eventType: string;

  sleep: string;

  selectedEditView: string;
  constructor() { }

  ngOnInit() {
    
    if (this.editMsmt) {
      this.selectedEditView = 'msmts';
    } else if (this.editAlarm) {
      this.selectedEditView = "alarm";
    } else if (this.eventText && this.eventType) {
      this.selectedEditView = "event";
    } else if (this.sleep) {
      this.selectedEditView = "sleep";
    }
  }

}
