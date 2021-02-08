import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { EditedEvent } from "@models/events.model";
import { IManagedObject } from "@c8y/client";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.scss"],
})
export class EditInstructionComponent implements OnInit {
  editedValue;
  newValue = { fragment: "", series: "", value: "", unit: "" };
  newAlarm = { alarmType: "", alarmText: ""};
  newEvent: EditedEvent = {
    eventType: "",
    eventText: "",
    eventAccuracy: "",
    eventLatitude: "",
    eventLongitude: "",
    eventAltitude: "",
  };

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

  constructor(
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService
  ) {}
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
    const pos = this.editedValue.index;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Measurement');
    
  }

  updateAlarm() {
    for (let i = 0; i < Object.keys(this.newAlarm).length; i++) {
      this.editedValue.value.values[i] = this.newAlarm[
        Object.keys(this.newAlarm)[i]
      ];
    }
    const pos = this.editedValue.index;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Alarm');
    
  }

  updateBasicEvent() {
    if (this.editedValue.value.messageId === "400") {
      for (let i = 0; i < Object.keys(this.newEvent).length; i++) {
        this.editedValue.value.values[i] = this.newEvent[
          Object.keys(this.newEvent)[i]
        ];
      }
    } else {
      for (let i = 0; i < Object.keys(this.newEvent).length; i++) {
        this.editedValue.value.values[i] = this.newEvent[
          Object.keys(this.newEvent)[i + 2]
        ];
      }
    }
    const pos = this.editedValue.index;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Event');
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
      for (let i = 0; i < Object.keys(this.newAlarm).length; i++) {
        this.newAlarm[
          Object.keys(this.newAlarm)[i]
        ] = this.editedValue.value.values[i];
      }
    } else if (this.editedValue.value.messageId === "400") {
      this.selectedEditView = "basicevent";
      for (let i = 0; i < Object.keys(this.newEvent).length; i++) {
        this.newEvent[
          Object.keys(this.newEvent)[i]
        ] = this.editedValue.value.values[i];
      }
    } else if (
      this.editedValue.value.messageId === "401" ||
      this.editedValue.value.messageId === "402"
    ) {
      this.selectedEditView = "event";
      for (let i = 0; i < Object.keys(this.newEvent).length; i++) {
        this.newEvent[
          Object.keys(this.newEvent)[i + 2]
        ] = this.editedValue.value.values[i];
      }
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

  editAlarmText(val) {
    this.newAlarm.alarmText = val;
  }
  editAlarmType(val) {
    this.newAlarm.alarmType = val;
  }

  editEventText(val) {
    this.newEvent.eventText = val;
  }
  editEventType(val) {
    this.newEvent.eventType = val;
  }

  editEventLatitude(val) {
    this.newEvent.eventLatitude = val;
  }
  editEventLongitude(val) {
    this.newEvent.eventLongitude = val;
  }
  editEventAltitude(val) {
    this.newEvent.eventAltitude = val;
  }
  editEventAccuracy(val) {
    this.newEvent.eventAccuracy = val;
  }

  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      (res) => {
        console.log(res);
        const alert = {
          text: `${type} updated successfully.`,
          type: "success",
        } as Alert;
        this.alertService.add(alert);
      },
      (error) => {
        const alert = {
          text: `Failed to save selected ${type}.`,
          type: "danger",
        } as Alert;
        this.alertService.add(alert);
      }
    );
    
  }
}
