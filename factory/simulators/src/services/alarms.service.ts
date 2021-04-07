import { Injectable } from "@angular/core";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { AlarmInstruction } from "@models/instruction.model";
import { CustomSimulator } from "@models/simulator.model";

@Injectable({
  providedIn: "root",
})
export class AlarmsService {
  constructor() {}
  alarms: AlarmInstruction[] = [];

  pushToAlarms(alarms: AlarmInstruction) {
    this.alarms.push(alarms);
  }
}
