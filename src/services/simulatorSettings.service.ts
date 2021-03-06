import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HelperService } from './helper.service';
import { MeasurementsService } from './measurements.service';
import { AlarmsService } from './alarms.service';
import { EventsService } from './events.service';
import { SleepService } from './sleep.service';
import { CustomSimulator } from '@models/simulator.model';
import { InstructionService } from './Instruction.service';
import { Instruction, InstructionCategory, SeriesInstruction } from '@models/instruction.model';
import {
  AdditionalParameter,
  CommandQueueEntry,
  IndexedCommandQueueEntry,
  MessageIds
} from '@models/commandQueue.model';
import { InputField } from '@models/inputFields.models';
import { ManagedObjectUpdateService } from './ManagedObjectUpdate.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SimulatorSettingsService {
  allTypesSeries = [];
  allInstructionsArray: SeriesInstruction[] = [];
  commandQueueUpdate = new BehaviorSubject<CommandQueueEntry[]>([]);
  commandQueueUpdate$ = this.commandQueueUpdate.asObservable();
  indexedCommandQueueUpdate = new BehaviorSubject<IndexedCommandQueueEntry[]>([]);
  indexedCommandQueueUpdate$ = this.indexedCommandQueueUpdate.asObservable();
  instructionsSeriesUpdate = new BehaviorSubject<SeriesInstruction[]>([]);
  instructionsSeriesUpdate$ = this.instructionsSeriesUpdate.asObservable();
  resultTemplate: { commandQueue: IndexedCommandQueueEntry[]; name: string } = {
    commandQueue: [],
    name: ''
  };
  alarmConfig = ['Generate repeated alarms', 'Alternate measurements with alarms'];
  selectedAlarmConfig: string = this.alarmConfig[0];
  eventConfig = ['Generate repeated events', 'Alternate measurements with events'];
  selectedEventConfig: string = this.eventConfig[0];
  randomSelected = 'linear';
  commandQueue: CommandQueueEntry[] = [];
  indexedCommandQueue: IndexedCommandQueueEntry[] = [];

  constructor(
    private helperService: HelperService,
    private measurementService: MeasurementsService,
    private instructionService: InstructionService,
    private alarmsService: AlarmsService,
    private eventsService: EventsService,
    private sleepService: SleepService,
    private updateService: ManagedObjectUpdateService
  ) {}

  fetchAllSeries(mo: CustomSimulator): Promise<SeriesInstruction[]> {
    this.allTypesSeries = mo.c8y_Series;
    return new Promise((resolve, reject) => resolve(this.allTypesSeries));
  }

  setCommandQueue(commandQueue: CommandQueueEntry[]) {
    this.commandQueue = commandQueue;
    this.commandQueueUpdate.next(this.commandQueue);
  }

  setAllInstructionsSeries(allInstructions: SeriesInstruction[]) {
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
      for (const { temp } of this.helperService
        .scaleTest(+value.minValue, +value.maxValue, +value.steps, this.randomSelected)
        .map((temp) => ({ temp }))) {
        // if else
        const instruction: Instruction = {
          fragment: value.fragment,
          series: value.series,
          unit: value.unit,
          color: value.color,
          type: InstructionCategory.Measurement,
          value: String(temp)
        };

        let toBePushed = this.instructionService.instructionToCommand(instruction);
        let index = String(this.allInstructionsArray.length - 1);
        let toBePushedWithIndex: IndexedCommandQueueEntry = { ...toBePushed, index: index } as IndexedCommandQueueEntry;

        this.resultTemplate.commandQueue.push(toBePushedWithIndex);
      }
    }

    this.generateAlarmsOrEventsOrSleep();
    return this.resultTemplate.commandQueue;
  }

  createIndexedCommandQueue(
    additionals: AdditionalParameter[],
    allInstructionsSeries: SeriesInstruction[],
    MOCommandQueue: CommandQueueEntry[]
  ) {
    let indexedCommandQueue: IndexedCommandQueueEntry[] = [];
    if (additionals) {
      additionals.forEach((element) => {
        let color = '#fff';
        if (element.index != 'single' && allInstructionsSeries[+element.index]) {
          color = allInstructionsSeries[+element.index].color;
        }
        element.color = color;
      });
      MOCommandQueue.forEach((element, index) => {
        indexedCommandQueue.push({
          ...element,
          ...additionals[index]
        } as IndexedCommandQueueEntry);
      });
    }
    return indexedCommandQueue;
  }

  generateInstructions(): CommandQueueEntry[] {
    const template = this.generateRequest();
    this.indexedCommandQueue.push(...template);
    this.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    return this.commandQueue;
  }

  getIndexedCommandQueue(): IndexedCommandQueueEntry[] {
    return this.indexedCommandQueue;
  }

  setIndexedCommandQueue(newIndexedCommandQueue: IndexedCommandQueueEntry[]) {
    this.indexedCommandQueue = newIndexedCommandQueue;
    this.setIndexedCommandQueueUpdate();
  }

  removeIndices(commandQueueEntryWithIndex: IndexedCommandQueueEntry): CommandQueueEntry {
    return (({ deviation, mirrored, index, ...nonIndex }) => nonIndex)(commandQueueEntryWithIndex);
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
    if (this.alarmsService.alarms.length && !this.resultTemplate.commandQueue.length) {
      const alarm = this.alarmsService.alarms[0];
      let instruction: Instruction = {
        alarmText: alarm.alarmText,
        messageId: alarm.messageId,
        alarmType: alarm.alarmType,
        type: InstructionCategory.Alarm
      };
      this.pushToResultTemplate(instruction);
    } else if (this.eventsService.events.length && !this.resultTemplate.commandQueue.length) {
      const event = this.eventsService.events[0];
      if (event.messageId === MessageIds.Basic) {
        let instruction: Instruction = {
          messageId: event.messageId,
          eventText: event.eventText,
          eventType: event.eventType,
          eventCategory: '',
          type: InstructionCategory.BasicEvent
        };
        this.pushToResultTemplate(instruction);
      } else if (event.messageId === MessageIds.LocationUpdate || event.messageId === MessageIds.LocationUpdateDevice) {
        let instruction: Instruction = {
          messageId: event.messageId,
          type: InstructionCategory.LocationUpdateEvent,
          eventCategory: '',
          latitude: event.latitude,
          longitude: event.longitude,
          altitude: event.altitude,
          accuracy: event.accuracy
        };
        this.pushToResultTemplate(instruction);
      }
    } else if (this.sleepService.sleeps.length && !this.resultTemplate.commandQueue.length) {
      const sleep = this.sleepService.sleeps[0];
      for (let i = 0; i < (+sleep.numberOfSleeps || 1); i++) {
        let instruction: Instruction = {
          type: InstructionCategory.Sleep,
          seconds: sleep.seconds,
          color: sleep.color || ''
        };
        
        this.pushToResultTemplate(instruction);
      }
    }
  }

  buttonHandler(
    inputField: InputField,
    instructionValue: SeriesInstruction | Partial<SeriesInstruction>,
    allInstructionsSeries: SeriesInstruction[]
  ): SeriesInstruction | Partial<SeriesInstruction> {
    if (inputField.name === 'sleepsEqualToInstructions') {
      let steps = 0;
      for (let entry of allInstructionsSeries) {
        if (entry.steps) {
          steps += +entry.steps + 1;
        }
        if (entry.type === InstructionCategory.Sleep && entry.numberOfSleeps) {
          steps += +entry.numberOfSleeps;
        }
      }
      instructionValue['numberOfSleeps'] = String(steps);
    }
    return instructionValue;
  }

  pushToResultTemplate(instruction: Instruction) {
    let toBePushed: CommandQueueEntry = this.instructionService.instructionToCommand(instruction);
    let index = String(this.allInstructionsArray.length - 1);
    let toBePushedWithIndex: IndexedCommandQueueEntry = {
      ...toBePushed,
      index: index
    } as IndexedCommandQueueEntry;
    this.resultTemplate.commandQueue.push(toBePushedWithIndex);
  }

  resetUsedArrays() {
    this.measurementService.measurements = [];
    this.measurementService.uniqueMeasurementsArray = [];
    this.alarmsService.alarms = [];
    this.eventsService.events = [];
    this.sleepService.sleeps = [];
  }

  pushToInstructionsArray(instructionValue: SeriesInstruction) {
    this.allInstructionsArray.push(instructionValue);
  }

  updateAll(indexedCommandQueue: IndexedCommandQueueEntry[], commandQueue: CommandQueueEntry[]) {
    this.indexedCommandQueue = indexedCommandQueue;
    this.commandQueue = commandQueue;
  }

  updateCommandQueueAndIndicesFromIndexedCommandQueue(indexedCommandQueue: IndexedCommandQueueEntry[]) {
    this.setIndexedCommandQueue(indexedCommandQueue);
    let commandQueue = this.removeIndicesFromIndexedCommandQueueArray(indexedCommandQueue);
    this.updateAll(indexedCommandQueue, commandQueue);
    this.setIndexedCommandQueueUpdate();
    let additionals: AdditionalParameter[] = this.indexedCommandQueue.map((entry) => {
      return {
        index: entry.index,
        mirrored: entry.mirrored,
        deviation: entry.deviation
      } as AdditionalParameter;
    });
    this.updateService.updateMOCommandQueueAndIndices(commandQueue, additionals);
  }

  objectContainsSearchString(series, searchString) {
    const modifiedSeries = this.modifyInstructionSeries(series);
    const value = _.pickBy(modifiedSeries, (value, key) => {
      if (isNaN(Number(value.toString())) && isNaN(Number(searchString.toString()))) {
        return (
          key
            .toString()
            .toLowerCase()
            .replace('/ /g', '')
            .includes(searchString.toString().toLowerCase().replace('/ /g', '')) ||
          value.toString().toLowerCase().replace('/ /g', '').includes(searchString.toLowerCase().replace('/ /g', ''))
        );
      } else {
        return (
          key
            .toString()
            .toLowerCase()
            .replace('/ /g', '')
            .includes(searchString.toString().toLowerCase().replace('/ /g', '')) ||
          value.toString().replace('/ /g', '').includes(searchString.replace('/ /g', ''))
        );
      }
    });
    return _.isEmpty(value) ? false : true;
  }

  modifyInstructionSeries(series) {
    let modifiedSeries = series.type === 'SmartRest' ? { ...series.instruction, type: series.type } : series;
    if (series.type !== 'SmartRest' || series.type !== 'Measurement') {
      const { scalingOption, ...nonOptionSeries } = modifiedSeries;
      modifiedSeries = nonOptionSeries;
    }
    if (
      modifiedSeries.type === InstructionCategory.Alarm ||
      modifiedSeries.type === InstructionCategory.BasicEvent ||
      modifiedSeries.type === InstructionCategory.LocationUpdateEvent
    ) {
      const category = {
        '301': 'CRITICAL',
        '302': 'MAJOR',
        '303': 'MINOR',
        '400': 'Basic',
        '401': 'Location Update',
        '402': 'Location Update with Device'
      }[modifiedSeries.messageId];
      const series = { ...modifiedSeries, category: category.toLowerCase() };
      const { messageId, ...nonMessageId } = series;
      modifiedSeries = nonMessageId;
    }
    return modifiedSeries;
  }
}
