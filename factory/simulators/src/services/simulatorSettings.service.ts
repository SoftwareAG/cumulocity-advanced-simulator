import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";
import { MeasurementsService } from "./measurements.service";
import { AlarmsService } from "./alarms.service";
import { EventsService } from "./events.service";
import { CustomSimulator } from "@models/simulator.model";
import { InstructionService } from "./Instruction.service";
import { Instruction, InstructionCategory } from "@models/instruction.model";
import { CommandQueueEntry, IndexedCommandQueueEntry, MessageIds } from "@models/commandQueue.model";
import { BehaviorSubject, Observable } from "rxjs";
import { SleepService } from "./sleep.service";
import { ManagedObjectUpdateService } from "./ManagedObjectUpdate.service";
import * as _ from 'lodash';
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

  instructionsSeriesUpdate = new BehaviorSubject<any[]>([]);
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

  // randomSelected = false;
  randomSelected = 'linear';

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
    this.commandQueue = commandQueue;
    this.indexedCommandQueue = this.commandQueue.map((entry, index) => ({...entry, index:this.indices[index]}));
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
    for (let value of this.measurementService.uniqueMeasurementsArray) {
      for (const { temp, index } of this.helperService
        .scaleTest(value.minValue, value.maxValue, value.steps, this.randomSelected)
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
          // this.instructionService.test(instruction);
          let index = this.setIndexForCommandQueueEntry();
          let toBePushedWithIndex = {...toBePushed, index} as IndexedCommandQueueEntry;
          
        this.resultTemplate.commandQueue.push(toBePushedWithIndex);

        // Add sleep after inserting measurement

        if (value.sleep && value.sleep !== +"") {
          this.resultTemplate.commandQueue.push({
            type: "sleep",
            seconds: value.sleep,
          });
        }
      } 
    }
    this.generateAlarmsOrEventsOrSleep();
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

  setIndexedCommandQueue(newIndexedCommandQueue: IndexedCommandQueueEntry[]) {
    this.indexedCommandQueue = newIndexedCommandQueue;
  }

  removeIndices(commandQueueEntryWithIndex: IndexedCommandQueueEntry): CommandQueueEntry {
    return ( ({mirrored, index, ...nonIndex}) => nonIndex) (commandQueueEntryWithIndex);
  }

  removeIndicesFromIndexedCommandQueueArray(indexedCommandQueueArray: IndexedCommandQueueEntry[]): CommandQueueEntry[] {
    let commandQueueWithoutIndices = [];
    indexedCommandQueueArray.forEach((entry) => commandQueueWithoutIndices.push(this.removeIndices(entry)));
    return commandQueueWithoutIndices;
  }

  setIndexedCommandQueueUpdate() {
    this.indexedCommandQueueUpdate.next(this.indexedCommandQueue);
  }

  generateAlarmsOrEventsOrSleep() {

      let instruction: Instruction;

      if (this.alarmsService.alarms.length && !this.resultTemplate.commandQueue.length) {
        const alarm = this.alarmsService.alarms[0];
        instruction = {
          alarmText: alarm.alarmText,
          messageId: alarm.messageId,
          alarmType: alarm.alarmType,
          type: InstructionCategory.Alarm,
        };
      } else if (this.eventsService.events.length && !this.resultTemplate.commandQueue.length) {
        const event = this.eventsService.events[0];
        if (event.messageId === MessageIds.Basic) {
          instruction = {
            messageId: event.messageId,
            eventText: event.eventText,
            eventType: event.eventType,
            eventCategory: '',
            type: InstructionCategory.BasicEvent
          }
        } else if (event.messageId === MessageIds.LocationUpdate || event.messageId === MessageIds.LocationUpdateDevice) {
          instruction = {
            messageId: event.messageId,
            type: InstructionCategory.LocationUpdateEvent,
            eventCategory: '',
            latitude: event.latitude,
            longitude: event.longitude,
            altitude: event.altitude,
            accuracy: event.accuracy
          }
        }
      } else if (this.sleepService.sleeps.length && !this.resultTemplate.commandQueue.length) {
        const sleep = this.sleepService.sleeps[0];
        instruction = {
          type: InstructionCategory.Sleep,
          seconds: sleep.seconds
        }
      }

      let toBePushed = this.instructionService.instructionToCommand(instruction);
      let index = this.setIndexForCommandQueueEntry();
      let toBePushedWithIndex = {...toBePushed, index} as IndexedCommandQueueEntry;
      this.resultTemplate.commandQueue.push(toBePushedWithIndex);
  }

  resetUsedArrays() {
    this.measurementService.measurements = [];
    this.measurementService.uniqueMeasurementsArray = [];
    this.alarmsService.alarms = [];
    this.eventsService.events = [];
    this.sleepService.sleeps = [];
    // this.allInstructionsArray = [];
  }

  pushToInstructionsArray(instructionValue) {
    this.allInstructionsArray.push(instructionValue);
  }

  setIndexForCommandQueueEntry(): string {
    let index;
    let indexed = this.indexedCommandQueue.filter((entry) => entry.index !== 'single');
    if (!indexed.length) {
      index = '0';
    } else {
      const lastEntry = indexed[indexed.length-1].index;
      index = (Number(lastEntry) + 1).toString();
    }
    return index;
  }

  updateAll(indexedCommandQueue: IndexedCommandQueueEntry[], commandQueue: CommandQueueEntry[], indices: string[]) {
    this.indexedCommandQueue = indexedCommandQueue;
    this.commandQueue = commandQueue;
    this.indices = indices;
  }

  updateCommandQueueAndIndicesFromIndexedCommandQueue(indexedCommandQueue: IndexedCommandQueueEntry[]) {
    this.setIndexedCommandQueue(indexedCommandQueue);
    let commandQueue = this.removeIndicesFromIndexedCommandQueueArray(indexedCommandQueue);
    let indices = this.indexedCommandQueue.map((entry) => entry.index);
    this.updateAll(indexedCommandQueue, commandQueue, indices);
    this.setIndexedCommandQueueUpdate();
    this.updateService.updateMOCommandQueueAndIndices(this.commandQueue, this.indices, this.indexedCommandQueue.map((entry) => entry.mirrored));
  }

  objectContainsSearchString(series, searchString) {

    const modifiedSeries = this.modifyInstructionSeries(series);
    const value = _.pickBy(modifiedSeries, (value, key) => {
      if (isNaN(Number(value.toString())) && isNaN(Number(searchString.toString()))) {
      return (
        key
          .toString()
          .toLowerCase()
          .replace("/ /g", "")
          .includes(
            searchString.toString().toLowerCase().replace("/ /g", "")
          ) ||
        value
          .toString()
          .toLowerCase()
          .replace("/ /g", "")
          .includes(searchString.toLowerCase().replace("/ /g", ""))
      ); } else {
        return (
          key
            .toString()
            .toLowerCase()
            .replace("/ /g", "")
            .includes(
              searchString.toString().toLowerCase().replace("/ /g", "")
            ) ||
          value
            .toString()
            .replace("/ /g", "")
            .includes(searchString.replace("/ /g", ""))
        );
      }
    });
    return _.isEmpty(value) ? false : true;
  }

  modifyInstructionSeries(series) {
    let modifiedSeries = series.type === 'SmartRest' ? {...series.instruction, type: series.type } : series;
    if (series.type !== 'SmartRest' || series.type !== 'Measurement') {
      const {option, ...nonOptionSeries} = modifiedSeries;
      modifiedSeries = nonOptionSeries;
    }
    if (modifiedSeries.type === InstructionCategory.Alarm || modifiedSeries.type === InstructionCategory.BasicEvent || modifiedSeries.type === InstructionCategory.LocationUpdateEvent) {
      const category = {'301': 'CRITICAL', '302': 'MAJOR', '303': 'MINOR', '400': 'Basic', '401': 'Location Update', '402': 'Location Update with Device'} [modifiedSeries.messageId];
      const series = {...modifiedSeries, category: category.toLowerCase()};
      const {messageId, ...nonMessageId} = series;
      modifiedSeries = nonMessageId;
    }
    return modifiedSeries;
  }

 
}
