import { Injectable } from '@angular/core';
import { AlarmInstruction, BasicEventInstruction, EventInstruction, MeasurementInstruction, SleepInstruction } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor() { } 

  private commandQueueEntryTemplate(messageId: string, values){
    return `{
      "messageId": ${messageId},
      "type": "builtin",
      "values": ${JSON.stringify(values)}, 
    }`;
  }


  instructionToCommand(instruction: MeasurementInstruction | AlarmInstruction | BasicEventInstruction | EventInstruction | SleepInstruction): string {
    let commandQueueEntry;
    switch(instruction.type){
      case 'Measurement': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.fragment, instruction.series, instruction.value, instruction.unit]); break;
      case 'BasicEvent': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.eventType, instruction.eventText]); break;
      case 'Alarm': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.alarmType, instruction.alarmText]); break;
      case 'Event': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.eventType, instruction.eventText]); break;
      case 'Sleep': commandQueueEntry = this.commandQueueEntryTemplate('200', [instruction.sleep]); break;

    }
    return commandQueueEntry;
  }

  
  commandQueueEntryToInstruction(commandQueueEntry): MeasurementInstruction | AlarmInstruction | BasicEventInstruction | EventInstruction | SleepInstruction {
    if (commandQueueEntry.type === "Sleep") {
      return {
        type: 'Sleep',
        sleep: commandQueueEntry.seconds
      };
    }

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
