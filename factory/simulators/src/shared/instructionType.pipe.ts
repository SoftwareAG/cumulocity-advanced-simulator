import { Pipe, PipeTransform } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { CustomSimulator } from '@models/simulator.model';

@Pipe({
  name: 'instructionType'
})
export class InstructionTypePipe implements PipeTransform {

  transform(value: CommandQueueEntry[]): {measurements: number; alarms: number; events: number; sleep: number; smartRest: number;} {

    let lengths: {measurements: number;
    alarms: number; events: number; sleep: number; smartRest: number} = {
      measurements: 0,
      alarms: 0,
      events: 0,
      sleep: 0,
      smartRest: 0
    };
    let measurements = 0;
    let alarms = 0;
    let events = 0;
    let sleep = 0;
    let smartRest = 0;

    for (let val of value) {
      if (val.type === 'sleep') {
        sleep += 1;
      } else if (val.type === 'message') {
        smartRest += 1;
      } 
      else {
        switch(val.messageId) {
          case '200':
            measurements += 1;
            break;
          case '400':
          case '401':
          case '402':
            events += 1;
            break;
          case '301':
          case '302':
          case '303':
            alarms += 1;
            break;
        }
      }
    }
    lengths.measurements = measurements;
    lengths.alarms = alarms;
    lengths.events = events;
    lengths.sleep = sleep;
    lengths.smartRest = smartRest;
    return lengths;

}
}