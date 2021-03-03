import { Injectable } from '@angular/core';
import { CommandQueueEntry, CommandQueueType, MessageIds } from '@models/commandQueue.model';
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
      case 'Measurement': commandQueueEntry = this.commandQueueEntryTemplate(MessageIds.Measurement, [instruction.fragment, instruction.series, instruction.unit, instruction.value]); break;
      case 'BasicEvent': commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [instruction.eventType, instruction.eventText]); break;
      case 'Alarm': commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [instruction.alarmType, instruction.alarmText]); break;
      case 'LocationUpdateEvent': commandQueueEntry = this.commandQueueEntryTemplate(instruction.messageId, [instruction.eventType, instruction.eventText]); break;
      case 'Sleep': commandQueueEntry = { type: 'sleep', seconds: instruction.sleep } as CommandQueueEntry; break;
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
    
    if (commandQueueEntry.messageId === MessageIds.Minor || 
        commandQueueEntry.messageId === MessageIds.Major || 
        commandQueueEntry.messageId === MessageIds.Critical) {
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
        eventCategory: commandQueueEntry[0],
        eventType: commandQueueEntry.values[1],
        eventText: commandQueueEntry.values[2],
        messageId: commandQueueEntry.messageId
      };
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



}
