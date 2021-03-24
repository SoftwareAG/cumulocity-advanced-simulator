import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";
import { EventsService } from "./events.service";
import { CustomSimulator } from "@models/simulator.model";
import { InstructionService } from "./Instruction.service";
import { Instruction, InstructionCategory } from "@models/instruction.model";
import { CommandQueueEntry, IndexedCommandQueueEntry } from "@models/commandQueue.model";
import { BehaviorSubject, Observable } from "rxjs";
import { SleepService } from "./sleep.service";
import { ManagedObjectUpdateService } from "./ManagedObjectUpdate.service";

@Injectable({
  providedIn: "root",
})
export class SimulatorSettingsService {
  allTypesSeries = [];
  allInstructionsArray = [];
  commandQueueUpdate = new BehaviorSubject<CommandQueueEntry[]>([]);
  commandQueueUpdate$ = this.commandQueueUpdate.asObservable();

  
  indexedCommandQueueUpdate = new BehaviorSubject<IndexedCommandQueueEntry[]>([]);
  indexedCommandQueueUpdate$ = this.indexedCommandQueueUpdate.asObservable();

  instructionsSeriesUpdate = new BehaviorSubject([]);
  instructionsSeriesUpdate$ = this.instructionsSeriesUpdate.asObservable();

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
  indices = [];
  indexedCommandQueue: IndexedCommandQueueEntry[] = [];

  // allSeries = [];
  

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private instructionService: InstructionService,
    private alarmsService: AlarmsService,
    private eventsService: EventsService,
    private sleepService: SleepService,
    private updateService: ManagedObjectUpdateService
  ) {}

  fetchAllSeries(mo: CustomSimulator): Promise<any[]> {
    this.allTypesSeries = mo.c8y_Series;
    return new Promise((resolve, reject) => resolve(this.allTypesSeries));
  }

  setCommandQueueIndices(commandQueueIndices) {
    this.indices = commandQueueIndices;
  }

  setCommandQueue(commandQueue: CommandQueueEntry[]) {
    console.log('setCommandqueue', commandQueue);
    this.commandQueue = commandQueue;
    this.indexedCommandQueue = this.commandQueue.map((entry, index) => ({...entry, index:this.indices[index]}));
    console.log('indexedCommandQueue', this.indexedCommandQueue);
    this.indexedCommandQueueUpdate.next(this.indexedCommandQueue);
  }

  setAllInstructionsSeries(allInstructions) {
    this.allInstructionsArray = allInstructions;
    this.updateService.updateMOInstructionsArray(this.allInstructionsArray);
    this.setInstructionsUpdate();
  }

  setInstructionsUpdate() {
    this.instructionsSeriesUpdate.next(this.allInstructionsArray);
  }

  generateRequest() {
    this.resultTemplate.commandQueue = [];
    
    this.measurementService.createUniqueMeasurementsArray();
    console.info(this.measurementService.uniqueMeasurementsArray);
    for (let value of this.measurementService.uniqueMeasurementsArray) {
      for (const { temp, index } of this.helperService
        .scale(value.minValue, value.maxValue, value.steps, this.randomSelected)
        .map((temp, index) => ({ temp, index }))) {
          // if else
          const instruction: Instruction = {
            fragment: value.fragment,
            series: value.series,
            unit: value.unit,
            color: value.color,
            type: InstructionCategory.Measurement,
            value: temp
          };
          
          let toBePushed = this.instructionService.instructionToCommand(instruction);
          let index = this.setIndexForCommandQueueEntry();
          let toBePushedWithIndex = {...toBePushed, index};
          
          console.log('toBePushed', toBePushed);
          // const index = this.commandQueue[this.]
          console.log('CQ ', this.commandQueue[this.commandQueue.length-1]);

          // console.log('MUST DISPLAY INDEX', index);
          console.info(temp, value, instruction, toBePushed);
        this.resultTemplate.commandQueue.push(toBePushedWithIndex);

        // Add sleep after inserting measurement

        if (value.sleep && value.sleep !== +"") {
          this.resultTemplate.commandQueue.push({
            type: "sleep",
            seconds: value.sleep,
          });
        }
        // FIXME: get alarm config value directly from the sim-alarm component, preferably in the object.
        // Similarly for events and sleep
      } 
    }
    this.generateAlarms();
    this.generateEvents();
    this.generateSleeps();
    return this.resultTemplate.commandQueue;
  }

  generateInstructions() {
    const template = this.generateRequest();
    this.indexedCommandQueue.push(...template);
    this.indices = this.indexedCommandQueue.map((entry) => entry.index);
    this.commandQueue = this.removeIndicesFromIndexedCommandQueueArray(this.indexedCommandQueue);
    this.setIndexedCommandQueueUpdate();
    return this.commandQueue;
  }

  getUpdatedIndicesArray() {
    return this.indices;
  }

  getIndexedCommandQueue() {
    return this.indexedCommandQueue;
  }

  removeIndices(commandQueueEntryWithIndex: IndexedCommandQueueEntry): CommandQueueEntry {
    return (({index, ...nonIndex}) => nonIndex) (commandQueueEntryWithIndex);
  }

  removeIndicesFromIndexedCommandQueueArray(indexedCommandQueueArray: IndexedCommandQueueEntry[]): CommandQueueEntry[] {
    let commandQueueWithoutIndices = [];
    indexedCommandQueueArray.forEach((entry) => commandQueueWithoutIndices.push(this.removeIndices(entry)));
    return commandQueueWithoutIndices;
  }

  setIndexedCommandQueueUpdate() {
    this.indexedCommandQueueUpdate.next(this.indexedCommandQueue);
  }

  generateAlarms() {
    if (
      this.alarmsService.alarms.length &&
      !this.resultTemplate.commandQueue.length
    ) {
      let toBePushed = this.alarmsService.generateAlarms();
      let index = this.setIndexForCommandQueueEntry();
      let toBePushedWithIndex = {...toBePushed, index};
      this.resultTemplate.commandQueue.push(toBePushedWithIndex);

    }
  }

  generateEvents() {
    if (
      this.eventsService.events.length &&
      !this.resultTemplate.commandQueue.length
    ) {
      let toBePushed = this.eventsService.generateEvents();
      let index = this.setIndexForCommandQueueEntry();
      let toBePushedWithIndex = {...toBePushed, index};
      this.resultTemplate.commandQueue.push(toBePushedWithIndex);
    }
  }

  generateSleeps() {
    if (
      this.sleepService.sleeps.length &&
      !this.resultTemplate.commandQueue.length
    ) {
      this.resultTemplate.commandQueue.push(...this.sleepService.generateSleep());
      // FIXME: Fix here!
    }
  }

  resetUsedArrays() {
    this.measurementService.measurements = [];
    this.measurementService.uniqueMeasurementsArray = [];
    this.alarmsService.alarms = [];
    this.eventsService.events = [];
    this.sleepService.sleeps = [];
    this.allInstructionsArray = [];
  }

  pushToInstructionsArray(instructionValue) {
    this.allInstructionsArray.push(instructionValue);
    console.log('instructions array', this.allInstructionsArray);
  }

  setIndexForCommandQueueEntry(): string {
    let index;
    if (!this.commandQueue.length) {
      index = '0';
    } else {
      const lastEntryIndex = this.indexedCommandQueue[this.indexedCommandQueue.length-1].index;
      if (lastEntryIndex !== 'single') {
        index = (parseInt(lastEntryIndex) + 1).toString();
      }
    }
    return index;
  }

  updateAll(indexedCommandQueue: IndexedCommandQueueEntry[], commandQueue: CommandQueueEntry[], indices: string[]) {
    this.indexedCommandQueue = indexedCommandQueue;
    this.commandQueue = commandQueue;
    this.indices = indices;
  }

}
