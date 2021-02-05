import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { IManagedObject } from "@c8y/client";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";
import { Event } from "@models/events.model";

@Injectable({
  providedIn: "root",
})
export class SimulatorSettingsService {
  resultTemplate = { commandQueue: [], name: "" };
  measurements = [];
  newFragmentAdded = false;
  alarms: {
    level?: string;
    alarmType: string;
    alarmText: string;
    steps?: string;
  }[] = [];
  events: Event[];
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

  eventType: string;
  eventText: string;

  eventSteps: string;

  latitude: string;
  longitude: string;
  altitude: string;
  accuracy: string;

  randomSelected = false;

  mo: IManagedObject;
  data: any;
  simulatorName: string;
  commandQueue = [];

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private alarmsService: AlarmsService
  ) {}

  

  setEvents(events: Event[]) {
    this.events = events;
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
        this.currentMeasurement = this.measurementService.uniqueMeasurementsArray[this.measurementService.uniqueMeasurementsArray.length - 1];
        if (
          this.alarmsService.alarms &&
          this.alarmsService.selectedAlarmConfig === this.alarmsService.alarmConfig[1] &&
          index < this.alarmsService.alarms.length
        ) {
          let toBePushedAlarms = this.alarmsService.toAlarmTemplateFormat(this.alarmsService.alarms[index]);
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

      if (this.alarmsService.selectedAlarmConfig === this.alarmsService.alarmConfig[0]) {
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
    if (this.alarmsService.alarms.length && !this.measurementService.uniqueMeasurementsArray.length) {
      this.alarmsService.generateAlarms();
    }
  }
}
