import { getNumberOfCurrencyDigits } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { SeriesInstruction } from "@models/instruction.model";

@Pipe({
  name: "count",
})
export class CountPipe implements PipeTransform {
  transform(
    instructionSeries: SeriesInstruction[]
  ): {
    alarms: number;
    events: number;
    measurements: number;
    sleep: number;
    smartRest: number;
  } {
    let stats = {
      alarms: 0,
      events: 0,
      measurements: 0,
      sleep: 0,
      smartRest: 0,
    };
    stats.alarms = instructionSeries.filter((entry) => entry.type == 'Alarm').length;
    stats.events = instructionSeries.filter((entry) => entry.type == 'BasicEvent').length + instructionSeries.filter((entry) => entry.type == 'LocationUpdateEvent').length;
    stats.measurements = instructionSeries.filter((entry) => entry.type == 'Measurement').length;
    stats.sleep = instructionSeries.filter((entry) => entry.type == 'Sleep').length;
    stats.smartRest = instructionSeries.filter((entry) => entry.type == 'SmartRest').length;
    return stats;
  }
}
