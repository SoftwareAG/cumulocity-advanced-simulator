import { Injectable } from '@angular/core';
import { CommandQueueEntry, CommandQueueType, MessageIds } from '@models/commandQueue.model';
import { InputField } from '@models/inputFields.models';
import {
  AlarmInstruction,
  BasicEventInstruction,
  EventInstruction,
  Instruction,
  Instruction2,
  InstructionCategory,
  SeriesMeasurementInstruction,
  SleepInstruction,
  SmartInstruction
} from '@models/instruction.model';
import { AlarmsService } from './alarms.service';
import { EventsService } from './events.service';
import { MeasurementsService } from './measurements.service';
import { SleepService } from './sleep.service';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {
  SmartRestArray = [];

  constructor(
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private eventsService: EventsService,
    private sleepService: SleepService
  ) {}

  private commandQueueEntryTemplate(
    messageId: string,
    values, // FIXME set type
    type: CommandQueueType = CommandQueueType.builtin
  ): CommandQueueEntry {
    return {
      messageId: messageId,
      type: type,
      values: values
    };
  }

  instructionToCommand(instruction: Instruction): CommandQueueEntry {
    let commandQueueEntry;
    switch (instruction.type) {
      case 'Measurement':
        commandQueueEntry = this.commandQueueEntryTemplate(MessageIds.Measurement, [
          instruction.fragment,
          instruction.series,
          instruction.value.toString(),
          instruction.unit,
          ''
        ]);
        break;
      case 'BasicEvent':
        commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [
          instruction.eventType,
          instruction.eventText
        ]);
        break;
      case 'Alarm':
        commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [
          instruction.alarmType,
          instruction.alarmText
        ]);
        break;
      case 'LocationUpdateEvent':
        commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [
          instruction.latitude,
          instruction.longitude,
          instruction.altitude,
          instruction.accuracy
        ]);
        break;
      case 'Sleep':
        commandQueueEntry = {
          type: 'sleep',
          seconds: instruction.seconds
        } as CommandQueueEntry;
        break;
      case 'SmartRest':
        commandQueueEntry = this.smartRestInstructionToCommand(instruction);
        break;
    }
    if (instruction.color) {
      commandQueueEntry.color = instruction.color;
    }
    return commandQueueEntry;
  }

  pushToSeriesArrays(type: string, instructionValue: Instruction2) {
    switch (type) {
      case InstructionCategory.Measurement:
        this.measurementsService.pushToMeasurements(instructionValue as SeriesMeasurementInstruction);
        break;
      case InstructionCategory.Alarm:
        this.alarmService.pushToAlarms(instructionValue as AlarmInstruction);
        break;
      case InstructionCategory.BasicEvent:
        this.eventsService.pushToEvents(instructionValue as BasicEventInstruction);
        break;
      case InstructionCategory.LocationUpdateEvent:
        this.eventsService.pushToEvents(instructionValue as EventInstruction);
        break;
      case InstructionCategory.Sleep:
        this.sleepService.pushToSleeps(instructionValue as SleepInstruction);
        break;
      case InstructionCategory.SmartRest:
        break;
    }
  }

  smartRestInstructionToCommand(
    instruction: SmartInstruction, 
    smartRestSelectedConfig?
  ): CommandQueueEntry {
    let selectedSmartRest;
    if (smartRestSelectedConfig){
      selectedSmartRest = smartRestSelectedConfig;
    } else {
      let customValuesFromInstruction = Object.keys(instruction).filter(
        (key) => key !== 'type' && key !== ''
      );
      // Parse 'path' from each of the customValues of this.smartRestArray entries
      let customPaths = [];
      this.SmartRestArray.forEach((entry) => {
        let arr = [];
        entry.smartRestFields.customValues.forEach((customValue) => {
          arr.push(customValue.path);
        });
        customPaths.push(arr);
      });
      // Find index by comparing custompath entries with keys of the SmartInstruction
      const filteredIndex = customPaths.findIndex(
        (customPathsForEntry) =>
          this.compareArrays2(
            customValuesFromInstruction,
            customPathsForEntry
          ) === true
      );
      selectedSmartRest = this.SmartRestArray[filteredIndex];
    }
    const messageId = selectedSmartRest.smartRestFields.msgId;
    const templateId = selectedSmartRest.templateId;
    let values: string[];
    if (
      selectedSmartRest.smartRestFields.mandatoryValues.length
    ) {
      values = [''];
    } else {
      values = [];
    }
    values.push(...Object.values(instruction).filter((value) => value !== 'SmartRest'));
    return {
      type: CommandQueueType.message,
      templateId: templateId,
      messageId: messageId,
      values: values
    };
  }

  compareArrays2(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  commandQueueEntryToInstruction(commandQueueEntry: CommandQueueEntry): Instruction {
    if (commandQueueEntry.type === CommandQueueType.sleep) {
      return {
        type: InstructionCategory.Sleep,
        seconds: commandQueueEntry.seconds
      };
    }
    if (commandQueueEntry.messageId === MessageIds.Measurement) {
      return {
        type: InstructionCategory.Measurement,
        fragment: commandQueueEntry.values[0],
        series: commandQueueEntry.values[1],
        value: commandQueueEntry.values[2],
        unit: commandQueueEntry.values[3],
        messageId: commandQueueEntry.messageId
      };
    }

    if (
      commandQueueEntry.messageId === MessageIds.Minor ||
      commandQueueEntry.messageId === MessageIds.Major ||
      commandQueueEntry.messageId === MessageIds.Critical
    ) {
      return {
        type: InstructionCategory.Alarm,
        alarmType: commandQueueEntry.values[0],
        alarmText: commandQueueEntry.values[1],
        messageId: commandQueueEntry.messageId
      };
    }

    if (commandQueueEntry.messageId === MessageIds.Basic) {
      return {
        type: InstructionCategory.BasicEvent,
        eventCategory: '',
        eventType: commandQueueEntry.values[0],
        eventText: commandQueueEntry.values[1],
        messageId: commandQueueEntry.messageId
      };
    }

    if (
      commandQueueEntry.messageId === MessageIds.LocationUpdate ||
      commandQueueEntry.messageId === MessageIds.LocationUpdateDevice
    ) {
      return {
        type: InstructionCategory.LocationUpdateEvent,
        eventCategory: '',
        latitude: commandQueueEntry.values[0],
        longitude: commandQueueEntry.values[1],
        altitude: commandQueueEntry.values[2],
        accuracy: commandQueueEntry.values[3],
        messageId: commandQueueEntry.messageId
      };
    }

    if (commandQueueEntry.type === CommandQueueType.message) {
      let smartInstruction = { type: InstructionCategory.SmartRest };
      const instructionEntryFields = this.commandQueueEntryToSmartRest(commandQueueEntry);
      instructionEntryFields.forEach((entryField, index) => {
        smartInstruction[entryField] = commandQueueEntry.values[index];
      });
      return smartInstruction as SmartInstruction;
    }
  }

  // Returns array containing entry fields (keys) of smart instruction
  commandQueueEntryToSmartRest(commandQueueEntry: CommandQueueEntry): string[] {
    let entryFields: string[];
    const filtered = this.SmartRestArray.filter(
      (entry) =>
        entry.smartRestFields.msgId === commandQueueEntry.messageId && entry.templateId === commandQueueEntry.templateId
    )[0];
    if (filtered) {
      if (filtered.smartRestFields.mandatoryValues.length) {
        entryFields = [''];
      } else {
        entryFields = [];
      }
      filtered.smartRestFields.customValues.forEach((customValue) => {
        entryFields.push(customValue.path);
      });
    }
    return entryFields;
  }

  createSmartRestDynamicForm(instructionValue) {
    let smartRestForm: InputField[] = [];

    Object.entries(instructionValue).forEach(([key, value]) => {
      let inputField: InputField = {
        name: '',
        placeholder: '(required)',
        label: '',
        type: 'textField',
        required: true,
        hidden: false
      };
      if (key === 'type' || key === '') {
        inputField.hidden = true;
      }
      if (key.endsWith('.minimum') || key.endsWith('.maximum') || key === 'steps') {
        inputField.isNumber = true;
      }
      inputField.name = key;
      inputField.placeholder = '(required)';
      inputField.label = key;
      inputField.type = 'textField';
      inputField.defaultValue = value as string;
      smartRestForm.push(inputField);
    });
    return smartRestForm;
  }
}
