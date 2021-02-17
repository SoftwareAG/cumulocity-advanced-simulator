import { Injectable } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { Instruction } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor() { } 

  private commandQueueEntryTemplate(messageId: string, values): CommandQueueEntry {
    return {
      messageId: messageId,
      type: 'builtin',
      values: values
    };
  }


  instructionToCommand(instruction: Instruction): CommandQueueEntry {
    let commandQueueEntry;
    switch(instruction.type){
      case 'Measurement': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.fragment, instruction.series, instruction.unit, instruction.value]); break;
      case 'BasicEvent': commandQueueEntry = this.commandQueueEntryTemplate('400', [instruction.eventType, instruction.eventText]); break;
      case 'Alarm': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.alarmType, instruction.alarmText]); break;
      case 'Event': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.eventType, instruction.eventText]); break;
      case 'Sleep': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.sleep]); break;
    }
    if(instruction.color){ commandQueueEntry.color = instruction.color; }
    return commandQueueEntry;
  }

  
  commandQueueEntryToInstruction(commandQueueEntry: CommandQueueEntry): Instruction {
    if (commandQueueEntry.type === 'sleep') {
      return {
        type: 'Sleep',
        sleep: commandQueueEntry.seconds
      };
    }
    console.error(commandQueueEntry);
    if (commandQueueEntry.messageId === '200') {
      return {
        type: 'Measurement',
        fragment: commandQueueEntry.values[0],
        series: commandQueueEntry.values[1],
        unit: commandQueueEntry.values[2],
        value: commandQueueEntry.values[3]
      };
    }

    if (commandQueueEntry.messageId.startsWith("30")) {
      return {
        type: 'Alarm',
        alarmType: commandQueueEntry.values[0],
        alarmText: commandQueueEntry.values[1]
      };
    }

    if (commandQueueEntry.messageId === '400') {
      return {
        type: 'BasicEvent',
        eventType: commandQueueEntry.values[0],
        eventText: commandQueueEntry.values[1]
      };
    }

    if (commandQueueEntry.messageId === '401' || commandQueueEntry.messageId === '402') {
      return {
        type: 'Event',
        eventType: commandQueueEntry.values[0],
        eventText: commandQueueEntry.values[1],
        latitude: commandQueueEntry.values[2],
        longitude: commandQueueEntry.values[3],
        altitude: commandQueueEntry.values[4],
        accuracy: commandQueueEntry.values[5],
      };
    }
  }



}
