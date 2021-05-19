import { Injectable } from "@angular/core";
import {
  CommandQueueEntry,
  CommandQueueType,
} from "@models/commandQueue.model";
import {
  InstructionCategory,
  SmartRestInstruction,
} from "@models/instruction.model";
import { SmartRest } from "@models/smartREST.model";
import { BehaviorSubject } from "rxjs";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root",
})
export class SmartRESTService {
  constructor(private helperService: HelperService) {}
  values: string[][] = [];
  stringValues: string[] = [];
  commandQueueArray = [];

  smartRestConfig;

  smartRestUpdate = new BehaviorSubject([]);
  smartRestUpdate$ = this.smartRestUpdate.asObservable();

  smartRestOption = "linear";
  setSmartRestUpdate(config) {
    this.smartRestConfig = config;
    this.smartRestUpdate.next(this.smartRestConfig);
  }

  smartRESTTemplateToCommandQueueEntry(
    smartRestEntry: any,
    smartRESTTemplate: SmartRest
  ): CommandQueueEntry {
    let commandQueueEntry: CommandQueueEntry = {
      messageId: "",
      templateId: "",
      values: [],
      type: CommandQueueType.message,
    };
    Object.values(smartRestEntry).forEach((field) =>
      commandQueueEntry.values.push(field as string)
    );
    commandQueueEntry.messageId = smartRESTTemplate.smartRestFields.msgId;
    commandQueueEntry.templateId = smartRESTTemplate.templateId;
    return commandQueueEntry;
  }

  generateSmartRestRequest(
    smartRestInstructionArray: SmartRestInstruction[],
    smartRESTTemplate: SmartRest
  ): CommandQueueEntry[] {
    this.values = [];
    this.commandQueueArray = [];
    smartRestInstructionArray.forEach((instruction) => {
      let vals = [];
      const steps = instruction.steps;
      if (instruction.minValue && instruction.maxValue) {
        for (let { temp, index } of this.helperService
          .scaleTest(
            parseInt(instruction.minValue),
            parseInt(instruction.maxValue),
            parseInt(instruction.steps),
            this.smartRestOption
          )
          .map((temp, index) => ({ temp, index }))) {
          vals.push(temp.toString());
        }
      } else {
        console.log('instr vals ype string: ', instruction);
        vals.push(...this.fillArray(instruction.value, instruction.steps));
      }
      this.values.push(vals);
    });
    console.log('this.values: ', this.values);
    for (let i = 0; i < this.transposeArray(this.values).length; i++) {
      let initialValues = [];
      if (smartRESTTemplate.smartRestFields.mandatoryValues.length) {
        initialValues = [""];
      } else {
        initialValues = [];
      }
      let commandQueueEntry: CommandQueueEntry = {
        type: CommandQueueType.message,
        values: initialValues,
      };
      commandQueueEntry.values.push(...this.transposeArray(this.values)[i]);
      commandQueueEntry.messageId = smartRESTTemplate.smartRestFields.msgId;
      commandQueueEntry.templateId = smartRESTTemplate.templateId;
      this.commandQueueArray.push(commandQueueEntry);
    }

    return this.commandQueueArray;
  }

  transposeArray(arr: string[][]): string[][] {
    // Get just the first row to iterate columns first
    return arr[0].map(function (col, c) {
      // For each column, iterate all rows
      return arr.map(function (row, r) {
        return arr[r][c];
      });
    });
  }

  fillArray(value, len) {
    var arr = [];
    for (var i = 0; i <= len; i++) {
      arr.push(value);
    }
    return arr;
  }

  resetCommandQueueArray() {
    this.commandQueueArray = [];
    this.values = [];
  }

  convertToSmartRestModel(
    smartRestData: {
      [key: string]: number | string;
    },
    smartRestSelectedConfig
  ): SmartRestInstruction[] {
    const smartRestInstructionArray: SmartRestInstruction[] = [];
    smartRestSelectedConfig.smartRestFields.customValues.forEach(
      (customValue) => {
        let obj: SmartRestInstruction = {
          value: "",
          steps: "",
          type: InstructionCategory.SmartRest,
        };
        Object.entries(smartRestData).forEach(([key, value]) => {
          if (key === customValue.path) {
            obj.value = value as string;
          } else if (key === customValue.path + "_max") {
            obj.maxValue = value as string;
            obj.isNumber = true;
          } else if (key === customValue.path + "_min") {
            obj.minValue = value as string;
            obj.isNumber = true;
          } else if (key === "steps") {
            obj.steps = value as string;
            obj.isNumber = true;
          }
        });

        smartRestInstructionArray.push(obj as SmartRestInstruction);
      }
    );
    return smartRestInstructionArray;
  }
}
