import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";
import { EventsService } from "./events.service";

@Injectable({
  providedIn: "root",
})
export class SimulatorSettingsService {
  resultTemplate = { commandQueue: [], name: "" };
  
  alarmConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedAlarmConfig: string = this.alarmConfig[0];
  eventConfig = [
    "Generate repeated events",
    "Alternate measurements with events",
  ];
  selectedEventConfig: string = this.eventConfig[0];

  randomSelected = false;

  commandQueue = [];

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private alarmsService: AlarmsService,
    private eventsService: EventsService
  ) {}

  fetchCommandQueue(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      resolve(this.commandQueue);
    });
  }

  setCommandQueue(commandQueue) {
    this.commandQueue = commandQueue;
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
        // FIXME: get alarm config value directly from the sim-alarm component, preferably in the object.
        // Similarly for events and sleep
        if (
          this.alarmsService.alarms &&
          this.alarmsService.selectedAlarmConfig ===
            this.alarmsService.alarmConfig[1] &&
          index < this.alarmsService.alarms.length
        ) {
          let toBePushedAlarms = this.alarmsService.toAlarmTemplateFormat(
            this.alarmsService.alarms[index]
          );
          this.resultTemplate.commandQueue.push(JSON.parse(toBePushedAlarms));
        }

        if (
          this.eventsService.events &&
          this.selectedEventConfig === this.eventConfig[1] &&
          index < this.eventsService.events.length
        ) {
          let toBePushedEvents = this.eventsService.toEventTemplateFormat(
            this.eventsService.events[index]
          );
          this.resultTemplate.commandQueue.push(JSON.parse(toBePushedEvents));
        }
      }

      if (
        this.alarmsService.selectedAlarmConfig ===
        this.alarmsService.alarmConfig[0]
      ) {
        this.resultTemplate.commandQueue.push(...this.alarmsService.generateAlarms());
      }

      if (this.eventsService.selectedEventConfig === this.eventsService.eventConfig[0]) {
        this.resultTemplate.commandQueue.push(...this.eventsService.generateEvents());
      }
    }
    this.displayAlarmsWithoutMeasurements();
    this.displayEventsWithoutMeasurements();
    this.resetUsedArrays();
    return this.resultTemplate.commandQueue;
  }

  displayAlarmsWithoutMeasurements() {
    if (
      this.alarmsService.alarms.length &&
      !this.resultTemplate.commandQueue.length
    ) {
      this.resultTemplate.commandQueue.push(...this.alarmsService.generateAlarms());

    }
  }

  displayEventsWithoutMeasurements() {
    if (
      this.eventsService.events.length &&
      !this.resultTemplate.commandQueue.length
    ) {
      this.resultTemplate.commandQueue.push(...this.eventsService.generateEvents());
    }
  }

  resetUsedArrays() {
    this.measurementService.measurements = [];
    this.measurementService.uniqueMeasurementsArray = [];
    this.alarmsService.alarms = [];
    this.eventsService.events = [];
  }
}
