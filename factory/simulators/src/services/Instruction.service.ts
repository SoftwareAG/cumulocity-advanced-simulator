import { Injectable } from "@angular/core";
import {
  CommandQueueEntry,
  CommandQueueType,
  MessageIds,
} from "@models/commandQueue.model";
import { InputField } from "@models/inputFields.const";
import {
  Instruction,
  Instruction2,
  InstructionCategory,
  SmartInstruction,
} from "@models/instruction.model";

@Injectable({
  providedIn: "root",
})
export class InstructionService {
  constructor() {}
  SmartRestArray = [];

  private commandQueueEntryTemplate(
    messageId: string,
    values,
    type: CommandQueueType = CommandQueueType.builtin
  ): CommandQueueEntry {
    return {
      messageId: messageId,
      type: type,
      values: values,
    };
  }

  instructionToCommand(instruction: Instruction): CommandQueueEntry {
    let commandQueueEntry;
    switch (instruction.type) {
      case "Measurement":
        commandQueueEntry = this.commandQueueEntryTemplate(
          MessageIds.Measurement,
          [
            instruction.fragment,
            instruction.series,
            instruction.unit,
            instruction.value,
          ]
        );
        break;
      case "BasicEvent":
        commandQueueEntry = this.commandQueueEntryTemplate(
          instruction.messageId,
          [instruction.eventType, instruction.eventText]
        );
        break;
      case "Alarm":
        commandQueueEntry = this.commandQueueEntryTemplate(
          instruction.messageId,
          [instruction.alarmType, instruction.alarmText]
        );
        break;
      case "LocationUpdateEvent":
        commandQueueEntry = this.commandQueueEntryTemplate(
          instruction.messageId,
          [instruction.eventType, instruction.eventText]
        );
        break;
      case "Sleep":
        commandQueueEntry = {
          type: "sleep",
          seconds: instruction.sleep,
        } as CommandQueueEntry;
        break;
      case 'SmartRest': 
      commandQueueEntry = this.smartRestInstructionToCommand(instruction)
      break;
    }
    if (instruction.color) {
      commandQueueEntry.color = instruction.color;
    }
    return commandQueueEntry;
  }

  smartRestInstructionToCommand(
    instruction: SmartInstruction
  ): CommandQueueEntry {
    let customValuesFromInstruction = Object.keys(instruction).filter(
      (key) => key !== "type"
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
    const filteredIndex = customPaths.findIndex((customPathsForEntry) => this.compareArrays2(customValuesFromInstruction, customPathsForEntry) === true);
    const messageId = this.SmartRestArray[filteredIndex].smartRestFields.msgId;
    const templateId = this.SmartRestArray[filteredIndex].templateId;
    const values: string[] =  [""];
    values.push(...Object.values(instruction).filter((value) => value !== "SmartRest"));
    return {
      type: CommandQueueType.message,
      templateId: templateId,
      messageId: messageId,
      values: values,
    };
  }

  compareArrays2(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
  }

  commandQueueEntryToInstruction(
    commandQueueEntry: CommandQueueEntry
  ): Instruction {
    if (commandQueueEntry.type === CommandQueueType.sleep) {
      return {
        type: InstructionCategory.Sleep,
        sleep: commandQueueEntry.seconds,
      };
    }
    if (commandQueueEntry.messageId === MessageIds.Measurement) {
      return {
        type: InstructionCategory.Measurement,
        fragment: commandQueueEntry.values[0],
        series: commandQueueEntry.values[1],
        unit: commandQueueEntry.values[2],
        value: commandQueueEntry.values[3],
        messageId: commandQueueEntry.messageId,
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
        messageId: commandQueueEntry.messageId,
      };
    }

    if (commandQueueEntry.messageId === MessageIds.Basic) {
      return {
        type: InstructionCategory.BasicEvent,
        eventCategory: commandQueueEntry[0],
        eventType: commandQueueEntry.values[1],
        eventText: commandQueueEntry.values[2],
        messageId: commandQueueEntry.messageId,
      };
    }

    if (commandQueueEntry.type === CommandQueueType.message) {
      let smartInstruction = { type: InstructionCategory.SmartRest };
      const instructionEntryFields = this.commandQueueEntryToSmartRest(
        commandQueueEntry
      );
      instructionEntryFields.forEach((entryField, index) => {
        smartInstruction[entryField] = commandQueueEntry.values[index+1];
      });
      return smartInstruction as SmartInstruction;
    }
    /*
    if (commandQueueEntry.messageId === '401' || commandQueueEntry.messageId === '402') {
      return {
        type: InstructionCategory.LocationUpdateEvent,
        eventCategory: commandQueueEntry.values[0],
        eventType: commandQueueEntry.values[1],
        eventText: commandQueueEntry.values[2],
        latitude: commandQueueEntry.values[3],
        longitude: commandQueueEntry.values[4],
        altitude: commandQueueEntry.values[5],
        accuracy: commandQueueEntry.values[6],
        messageId: commandQueueEntry.messageId,
      };
    }*/
  }

  // Returns array containing entry fields (keys) of smart instruction
  commandQueueEntryToSmartRest(commandQueueEntry: CommandQueueEntry): string[] {
    let entryFields: string[] = [];
    const filtered = this.SmartRestArray.filter(
      (entry) =>
        entry.smartRestFields.msgId === commandQueueEntry.messageId &&
        entry.templateId === commandQueueEntry.templateId
    )[0];
    if (filtered) {
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
        name: "",
        placeholder: "(required)",
        label: "",
        type: "textField",
        required: true,
        hidden: false
      };
      if (key === 'type') {
        inputField.hidden = true;
      }
      inputField.name = key;
      inputField.placeholder = "(required)";
      inputField.label = key;
      inputField.type = "textField";
      inputField.defaultValue = value as string;
      smartRestForm.push(inputField);
    });
    return smartRestForm;
  }
}
