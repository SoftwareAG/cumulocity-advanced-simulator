import { Injectable } from '@angular/core';
import { CommandQueueEntry, CommandQueueType } from '@models/commandQueue.model';
import { Instruction, InstructionCategory } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor() { } 

  private commandQueueEntryTemplate(messageId: string, values, type: CommandQueueType=CommandQueueType.builtin, ): CommandQueueEntry {
    return {
      messageId: messageId,
      type: type,
      values: values
    };
  }


  instructionToCommand(instruction: Instruction): CommandQueueEntry {
    let commandQueueEntry;
    switch(instruction.type){
      case 'Measurement': commandQueueEntry = this.commandQueueEntryTemplate('200',[instruction.fragment, instruction.series, instruction.unit, instruction.value]); break;
      case 'BasicEvent': commandQueueEntry = this.commandQueueEntryTemplate('400', [instruction.eventType, instruction.eventText]); break;
      case 'Alarm': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.alarmType, instruction.alarmText]); break;
      case 'LocationUpdateEvent': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.eventType, instruction.eventText]); break;
      case 'Sleep': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.sleep], CommandQueueType.sleep); break;
      case 'SmartRest': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.value], CommandQueueType.message); break;
    }
    if(instruction.color){ commandQueueEntry.color = instruction.color; }
    return commandQueueEntry;
  }

  
  commandQueueEntryToInstruction(commandQueueEntry: CommandQueueEntry): Instruction {
    if (commandQueueEntry.type === CommandQueueType.sleep) {
      return {
        type: InstructionCategory.Sleep,
        sleep: commandQueueEntry.seconds
      };
    }
    console.error(commandQueueEntry);
    if (commandQueueEntry.messageId === '200') {
      return {
        type: InstructionCategory.Measurement,
        fragment: commandQueueEntry.values[0],
        series: commandQueueEntry.values[1],
        unit: commandQueueEntry.values[2],
        value: commandQueueEntry.values[3]
      };
    }

    if (commandQueueEntry.messageId.startsWith("30")) {
      return {
        type: InstructionCategory.Alarm,
        alarmCategory: commandQueueEntry.values[0],
        alarmType: commandQueueEntry.values[1],
        alarmText: commandQueueEntry.values[2]
      };
    }

    if (commandQueueEntry.messageId === '400') {
      return {
        type: InstructionCategory.BasicEvent,
        eventCategory: commandQueueEntry[0],
        eventType: commandQueueEntry.values[1],
        eventText: commandQueueEntry.values[2]
      };
    }

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
      };
    }
  }



}
