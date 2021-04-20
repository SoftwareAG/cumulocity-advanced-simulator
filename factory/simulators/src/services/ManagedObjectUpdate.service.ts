import { Injectable } from '@angular/core';
import { AlertService, Alert } from '@c8y/ngx-components';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { CustomSimulator } from '@models/simulator.model';
import { SimulatorsServiceService } from './simulatorsService.service';

@Injectable({
  providedIn: 'root'
})
export class ManagedObjectUpdateService {

mo: CustomSimulator;
constructor(private simService: SimulatorsServiceService,
  private alertService: AlertService) { }

setManagedObject(mo: CustomSimulator) {
  this.mo = mo;
}

updateSimulatorObject(mo: CustomSimulator) {
  return this.simService.updateSimulatorManagedObject(mo);
}

updateMOCommandQueueAndIndices(commandQueue: CommandQueueEntry[], indices: string[], mirrored: boolean[]) {
  this.mo.c8y_DeviceSimulator.commandQueue = commandQueue;
  this.mo.c8y_Indices = indices;
  this.mo.c8y_MirroredValues = mirrored;
}

updateMOInstructionsArray(instructionsArray) {
  this.mo.c8y_Series = instructionsArray;
}

simulatorUpdateFeedback(type: string, text: string) {
const alert = {
  text: text,
  type: type
} as Alert;
this.alertService.add(alert);
}

}
