import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IManagedObject } from "@c8y/client";
import { SimulatorsServiceService } from "../../../services/simulatorsService.service";
import { HelperService } from "../../../services/helper.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";

@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private simService: SimulatorsServiceService,
    private helperService: HelperService,
    private simSettings: SimulatorSettingsService
  ) {}

  resultTemplate = { commandQueue: [], name: "" };
  displayInstructionsOrSleep = false;
  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Sleep"];
  selectedConfig: string = this.defaultConfig[0];

  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "400" },
    { category: "Location Update Device", code: "400" },
  ];

  selectedEventCategory = this.eventCategories[0].category;
  measurements = [];
  newFragmentAdded = false;
  alarms: {
    level?: string;
    alarmType: string;
    alarmText: string;
    steps?: string;
  }[] = [];
  events: {
    code: string;
    eventType: string;
    eventText: string;
    steps: string;
  }[] &
    {
      code: string;
      lat: string;
      lon: string;
      alt: string;
      accuracy: string;
      steps: string;
    }[] = [];
  alarmConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedAlarmConfig: string = this.alarmConfig[0];
  eventConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedEventConfig: string = this.eventConfig[0];

  currentMeasurement: {
    sleep: string;
    fragment: string;
    series: string;
    minValue: string;
    maxValue: string;
    steps: string;
    unit: string;
  };

  currentAlarm: {
    level: string;
    alarmType: string;
    alarmText: string;
    steps: string;
    sleep: string;
  };

  eventType: string;
  eventText: string;

  eventSteps: string;

  latitude: string;
  longitude: string;
  altitude: string;
  accuracy: string;

  randomSelected = false;

  template = {
    fragment: null,
    series: null,
    minValue: null,
    maxValue: null,
    steps: null,
    unit: null,
    tempType: "measurement",
  };

  testArray = [];
  scaledArray = [];

  mo: IManagedObject;
  data: any;
  simulatorName: string;
  commandQueue = [];
  currentIndex: number;
  insertIndex: number;
  toAddMsmtOrSleep = false;
  toDisplay = false;
  value: string;
  displayEditView = false;

  alternateMsmts = [];
  editMsmt;

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.simulatorName = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.resultTemplate.name = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }

  onChangeOfEventConfig(val) {
    this.selectedEventConfig = val;
  }

  addAlarmToArray(val) {
    this.newFragmentAdded = true;
    this.currentAlarm = {
      level: val.alarm.level,
      alarmText: val.alarm.alarmText,
      alarmType: val.alarm.alarmType,
      steps: val.alarm.alarmSteps,
      sleep: val.alarm.alarmSleep,
    };
    this.selectedAlarmConfig = val.alarm.alarmConfig;
    for (let i = 0; i < parseInt(this.currentAlarm.steps); i++) {
      this.alarms.push(this.currentAlarm);
    }
  }

  addEventToArray() {
    switch (this.selectedEventCategory) {
      case this.eventCategories[0].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++) {
          this.events.push({
            code: this.eventCategories[0].code,
            eventType: this.eventType,
            eventText: this.eventText,
            steps: this.eventSteps,
          });
        }
        this.eventText = "";
        this.eventType = "";
        this.eventSteps = "";
        break;

      case this.eventCategories[1].category || this.eventCategories[2].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++) {
          this.events.push({
            code: this.eventCategories.find(
              (temp) => temp.category === this.selectedEventCategory
            ).code,
            lat: this.latitude,
            lon: this.longitude,
            alt: this.altitude,
            accuracy: this.accuracy,
            steps: this.eventSteps,
          });
        }
        this.latitude = "";
        this.longitude = "";
        this.altitude = "";
        this.accuracy = "";
        this.eventSteps = "";
        break;
    }
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  generateRequest() {
    
    this.simSettings.generateRequest();
    // console.log(this.simSettings.commandQueue);
  }


  updateCommandQueue(newCommandQueue) {
    this.commandQueue = newCommandQueue;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService
      .updateSimulatorManagedObject(this.mo)
      .then((result) => console.log(result));
  }

  insertSleepOrFragment(current) {
    this.toAddMsmtOrSleep = current.bool;
    this.insertIndex = current.index;
  }

  onSelectInstructions() {
    this.selectedConfig = this.defaultConfig[0];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  onSelectSleep() {
    this.selectedConfig = this.defaultConfig[3];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  updateCurrent(val) {
    this.displayEditView = true;
    this.displayInstructionsOrSleep = false;
    this.editMsmt = val;
    console.log(val);
  }

 
}
