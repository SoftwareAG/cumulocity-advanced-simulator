import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { IManagedObject } from "@c8y/client";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";

@Injectable({
  providedIn: "root",
})
export class SimulatorSettingsService {
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

  uniqueMeasurementsArray = [];
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

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private alarmsService: AlarmsService
  ) {}

  setMeasurements(measurements) {
    this.measurementService.measurements = measurements;
  }

  fetchCommandQueue() {
    return new Promise((resolve, reject) => {resolve(this.commandQueue)});
  }

  generateRequest() {
    this.resultTemplate.commandQueue = [];
    this.measurementService.createUniqueMeasurementsArray();

    for (let value of this.measurementService.uniqueMeasurementsArray) {
      for (const { temp, index } of this.helperService
        .scale(value.minValue, value.maxValue, value.steps, this.randomSelected)
        .map((temp, index) => ({ temp, index }))) {
        let toBePushed = this.measurementService.toMeasurementTemplate(
          value,
          temp
        );
        this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));

        // Add sleep after inserting measurement

        if (value.sleep && value.sleep !== "") {
          this.resultTemplate.commandQueue.push({
            type: "sleep",
            seconds: value.sleep,
          });
        }

        if (
          this.alarms &&
          this.selectedAlarmConfig === this.alarmConfig[1] &&
          index < this.alarms.length
        ) {
          let toBePushedAlarms = this.alarmsService.toAlarmTemplateFormat(this.alarms[index]);
          this.resultTemplate.commandQueue.push(JSON.parse(toBePushedAlarms));
        }

        if (
          this.events &&
          this.selectedEventConfig === this.eventConfig[1] &&
          index < this.events.length
        ) {
          this.toEventTemplateFormat(this.events[index]);
        }
      }

      if (this.selectedAlarmConfig === this.alarmConfig[0]) {
        this.alarmsService.generateAlarms();
      }

      if (this.selectedEventConfig === this.eventConfig[0]) {
        this.generateEvents();
      }
    }
    this.displayAlarmsWithoutMeasurements();
    this.commandQueue.push(...this.resultTemplate.commandQueue);
    // Save to backend
    //   this.simService
    //     .updateSimulatorManagedObject(this.mo)
    //     .then((res) => console.log(res));
  }

  // Create array containing unique fragments

  generateEvents() {
    for (let event of this.events) {
      this.toEventTemplateFormat(event);
      if (
        this.currentMeasurement.sleep &&
        this.selectedEventConfig === this.eventConfig[0]
      ) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: this.currentMeasurement.sleep,
        });
      }
    }
  }

  toEventTemplateFormat(event) {
    let toBePushed = `{
    "messageId": "CODE",
    "values": ["TYPE", "TEXT"], "type": "builtin"
  }`;
    let toBePushedLoc = `{
    "messageId": "CODE",
    "values": ["LAT", "LON", "ALT", "ACCURACY"], "type": "builtin"
  }`;

    if (event.code === "400") {
      toBePushed = toBePushed.replace("CODE", event.code);
      toBePushed = toBePushed.replace("TYPE", event.eventType);
      toBePushed = toBePushed.replace("TEXT", event.eventText);
      this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
    } else {
      toBePushedLoc = toBePushedLoc.replace("CODE", event.code);
      toBePushedLoc = toBePushedLoc.replace("LAT", event.lat);
      toBePushedLoc = toBePushedLoc.replace("LON", event.lon);
      toBePushedLoc = toBePushedLoc.replace("ALT", event.alt);
      toBePushedLoc = toBePushedLoc.replace("ACCURACY", event.accuracy);
      this.resultTemplate.commandQueue.push(JSON.parse(toBePushedLoc));
    }
  }

  displayAlarmsWithoutMeasurements() {
    if (this.alarms.length && !this.uniqueMeasurementsArray.length) {
      this.alarmsService.generateAlarms();
    }
  }
}
