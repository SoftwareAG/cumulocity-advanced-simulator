import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { EditedEvent } from "@models/events.model";
import { IManagedObject } from "@c8y/client";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { ActivatedRoute } from "@angular/router";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.scss"],
})
export class EditInstructionComponent implements OnInit {
  addInstructionsMode = false;
  editInstructionsMode = false;
  displayEditView = false;
  displayAddView = false;

  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Basic Event", "Sleep"];
  selectedConfig: string = this.defaultConfig[0];
  onChangeConfig(val) {
    this.selectedEditView = val;
  }
  alarmText: string;
  alarmType: string;
  
  eventText: string;
  eventType: string;
  
  sleep: string;
  
  selectedEditView: string;
  toEmit = false;
  edited: EditedMeasurement;
  data: any;
  
  mo: IManagedObject;
  editedValue;
  commandQueue = [];


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
  newSleep: string;

  @Input() set editedVal(val) {
    this.editedValue = val;
    this.switchEditTemplate();
  }

  get editedVal() {
    return this.editedValue;
  }
  
  @Output() updatedVal = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService
  ) {}

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    this.simSettings.setCommandQueue(this.commandQueue);
  }

  updateMsmt() {
    for (let i = 0; i < Object.keys(this.newValue).length; i++) {
      this.editedValue.value.values[i] = this.newValue[
        Object.keys(this.newValue)[i]
      ];
    }
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Measurement');
    
  }

  updateAlarm() {
    for (let i = 0; i < Object.keys(this.newAlarm).length; i++) {
      this.editedValue.value.values[i] = this.newAlarm[
        Object.keys(this.newAlarm)[i]
      ];
    }
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
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Event');
  }

  updateSleep() {
    if (this.editedValue.value.seconds) {
      this.editedValue.value.seconds = this.newSleep;
      this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
      this.updateCommandQueueInManagedObject(this.mo, 'Sleep');
    }
  }

  switchEditTemplate() {
    // FIXME: Add editValue cast to alarms, events and sleep
    if (this.editedValue.value.type === "Sleep") {
      this.selectedEditView = "Sleep";
      this.newSleep = this.editedValue.value.seconds;
    } else if (this.editedValue.value.messageId === "200") {
      this.selectedEditView = "Measurements";
      for (let i = 0; i < Object.keys(this.newValue).length; i++) {
        this.newValue[
          Object.keys(this.newValue)[i]
        ] = this.editedValue.value.values[i];
      }
    } else if (this.editedValue.value.messageId.startsWith("30")) {
      this.selectedEditView = "Alarms";
      for (let i = 0; i < Object.keys(this.newAlarm).length; i++) {
        this.newAlarm[
          Object.keys(this.newAlarm)[i]
        ] = this.editedValue.value.values[i];
      }
    } else if (this.editedValue.value.messageId === "400") {
      this.selectedEditView = "Basic Event";
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
  editSleep(val) {
    this.newSleep = val;
  }

  displayInstructionsOrSleep = false;
  editMeasurements;

  

  updateCurrent(val) {
    this.displayEditView = true;
    this.displayInstructionsOrSleep = false;
    this.editMeasurements = val;
  }
  clearAllInstructions() {

  }
  onSelectInstructions() {
    //    this.selectedConfig = this.defaultConfig[0];
    this.selectedEditView = "Measurements";
    this.displayInstructionsOrSleep = true;
    this.displayAddView = true;
    this.displayEditView = false;
  }

  onSelectSleep() {
    //  this.selectedConfig = this.defaultConfig[3];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  updateCommandQueue(newCommandQueue) {
    this.commandQueue = newCommandQueue;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simulatorervice
      .updateSimulatorManagedObject(this.mo)
      .then((result) => console.log(result));
  }

  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      (res) => {
        const alert = {
          text: `${type} updated successfully.`,
          type: "success",
        } as Alert;
        this.alertService.add(alert);
      },
      (error) => {
        const alert = {
          text: `Failed to save selected ${type.toLowerCase()}.`,
          type: "danger",
        } as Alert;
        this.alertService.add(alert);
      }
    );
    
  }
}
