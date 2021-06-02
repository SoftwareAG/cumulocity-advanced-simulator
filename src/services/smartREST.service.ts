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
      if (instruction.minValue && instruction.maxValue) {
        vals = this.helperService
          .scaleTest(
            +instruction.minValue,
            +instruction.maxValue,
            +instruction.steps,
            this.smartRestOption
          ).map((temp) => temp.toString());
      } else {
        vals.push(...this.fillArray(instruction.value, instruction.steps));
      }
      this.values.push(vals);
    });
    
    for (let i = 0; i < this.transposeArray(this.values).length; i++) {
      let initialValues = (smartRESTTemplate.smartRestFields.mandatoryValues.length) ? [""] : [];
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
    for (let customValue of smartRestSelectedConfig.smartRestFields.customValues) {
      if(customValue.value){ continue; }
      let obj: SmartRestInstruction = {
        value: "",
        steps: "",
        type: InstructionCategory.SmartRest,
      };
      Object.entries(smartRestData).forEach(([key, value]) => {
        switch(key){
          case customValue.path: obj.value = String(value);break;
          case customValue.path + "_max": obj.isNumber = true;obj.maxValue = String(value);break;
          case customValue.path + "_min": obj.isNumber = true;obj.minValue = String(value);break;
          case "steps": obj.isNumber = true;obj.steps = String(value);break;
        }

        
      });

      smartRestInstructionArray.push(obj as SmartRestInstruction);
    }
    return smartRestInstructionArray;
  }
}
