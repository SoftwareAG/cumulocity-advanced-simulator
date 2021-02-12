import { Injectable } from '@angular/core';
import { AlarmInstruction, BasicEventInstruction, EventInstruction, MeasurementInstruction, SleepInstruction } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor() { } 
  
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
