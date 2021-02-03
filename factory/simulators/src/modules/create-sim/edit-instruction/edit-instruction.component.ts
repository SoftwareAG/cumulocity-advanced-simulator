import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditedMeasurement } from 'src/models/editedMeasurement.model';
import { UpdateInstructionsService } from '../../../services/updateInstructions.service';

@Component({
  selector: 'app-edit-instruction',
  templateUrl: './edit-instruction.component.html',
  styleUrls: ['./edit-instruction.component.scss']
})
export class EditInstructionComponent implements OnInit {

  @Input() editedVal;
  @Output() updatedVal = new EventEmitter();

  constructor(private updatedService: UpdateInstructionsService) { }
  alarmText: string;
  alarmType: string;

  eventText: string;
  eventType: string;

  sleep: string;

  selectedEditView: string;

  edited: EditedMeasurement;
  

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


  emitToDetailView(){
    this.updatedService.setEditedMeasurement(this.edited);
  }

  updateMsmt() {
    // console.log(this.editedVal);
    // this.updatedVal.emit(this.editedVal);
    this.edited = this.editedVal;
    this.emitToDetailView();
  }

 

}
