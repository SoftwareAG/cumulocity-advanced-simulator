import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";
import { EventsService } from "./events.service";
import { CustomSimulator } from "@models/simulator.model";
import { InstructionService } from "./Instruction.service";
import { Instruction, InstructionCategory } from "@models/instruction.model";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SimulatorSettingsService {
  commandQueueUpdate = new BehaviorSubject<CommandQueueEntry[]>([]);
  commandQueueUpdate$ = this.commandQueueUpdate.asObservable();
  
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

  commandQueue: CommandQueueEntry[] = [];

  allSeries = [];
  allTypesSeries = [];

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private instructionService: InstructionService,
    private alarmsService: AlarmsService,
    private eventsService: EventsService
  ) {}

  fetchAllSeries(mo: CustomSimulator): Promise<any[]> {
    this.allTypesSeries = mo.c8y_Series;
    return new Promise((resolve, reject) => resolve(this.allTypesSeries));
  }

  setCommandQueue(commandQueue: CommandQueueEntry[]) {
    console.log('setCommandqueue', commandQueue);
    this.commandQueue = commandQueue;
    this.commandQueueUpdate.next(commandQueue);
  }

  generateRequest() {
    this.resultTemplate.commandQueue = [];
    
    this.measurementService.createUniqueMeasurementsArray();
    console.info(this.measurementService.uniqueMeasurementsArray);
    for (let value of this.measurementService.uniqueMeasurementsArray) {
      for (const { temp, index } of this.helperService
        .scale(value.minValue, value.maxValue, value.steps, this.randomSelected)
        .map((temp, index) => ({ temp, index }))) {
          
          const instruction: Instruction = {
            fragment: value.fragment,
            series: value.series,
            unit: value.unit,
            color: value.color,
            type: InstructionCategory.Measurement,
            value: temp
          };
          
          let toBePushed = this.instructionService.instructionToCommand(instruction);
          console.info(temp, value, instruction, toBePushed);
        this.resultTemplate.commandQueue.push(toBePushed);

        // Add sleep after inserting measurement

        if (value.sleep && value.sleep !== +"") {
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
    this.allSeries = [];
  }

  deleteMeasurementsFromCommandQueue(minMeasurement, maxMeasurement, commandQueue) {

  }
}
