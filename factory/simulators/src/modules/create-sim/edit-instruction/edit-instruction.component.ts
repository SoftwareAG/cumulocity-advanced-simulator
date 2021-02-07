import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { EditedMeasurement } from "src/models/editedMeasurement.model";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.scss"],
})
export class EditInstructionComponent implements OnInit {
  editedValue;
  newValue = { fragment: "", series: "", value: "", unit: "" };
  @Input() set editedVal(val) {
    this.editedValue = val;
    this.switchEditTemplate();
  }

  get editedVal() {
    return this.editedValue;
  }
  @Input() commandQueue;
  @Input() mo;
  @Output() updatedVal = new EventEmitter();

  constructor() {}
  alarmText: string;
  alarmType: string;

  eventText: string;
  eventType: string;

  sleep: string;

  selectedEditView: string;
  toEmit = false;
  edited: EditedMeasurement;

  ngOnInit() {}

  updateMsmt() {
    for (let i = 0; i < Object.keys(this.newValue).length; i++) {
      this.editedValue.value.values[i] = this.newValue[
        Object.keys(this.newValue)[i]
      ];
    }
    // TODO: Implement save in MO 
  }

  switchEditTemplate() {
    
    // FIXME: Add editValue cast to alarms, events and sleep
    if (this.editedValue.value.type === "sleep") {
      this.selectedEditView = "sleep";
    } else if (this.editedValue.value.messageId === "200") {
      this.selectedEditView = "msmts";
      for (let i = 0; i < Object.keys(this.newValue).length; i++) {
        this.newValue[
          Object.keys(this.newValue)[i]
        ] = this.editedValue.value.values[i];
      }
    } else if (this.editedValue.value.messageId.startsWith("30")) {
      this.selectedEditView = "alarm";
    }
  }

  editFragment(val) {
    this.newValue.fragment = val;
  }
  editSeries(val) {
    this.newValue.series = val;
  }
  editValue(val) {
    this.newValue.value = val;
  }
  editUnit(val) {
    this.newValue.unit = val;
  }
}
