import { Injectable } from '@angular/core';
import { AlertService, Alert } from '@c8y/ngx-components';
import { AdditionalParameter, CommandQueueEntry, CommandQueueC8YMapping } from '@models/commandQueue.model';
import { SeriesInstruction } from '@models/instruction.model';
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


updateMOCommandQueueAndIndices(commandQueue: CommandQueueEntry[], additionals: AdditionalParameter[]) {
  this.mo.c8y_DeviceSimulator.commandQueue = commandQueue;
    for(const key in CommandQueueC8YMapping){
      this.mo[ CommandQueueC8YMapping[key] ] = [];
      //console.log("this.mo overrwirde", this.mo, CommandQueueC8YMapping[key], key);
    }

    additionals.forEach((element: AdditionalParameter) => {
      for(let key in element){
        this.mo[ CommandQueueC8YMapping[key] ].push( element[key] );
        console.info("details", element, key, CommandQueueC8YMapping, CommandQueueC8YMapping[key], element[key], this.mo);
      }
      
    });
  console.error("mo", this.mo, additionals, CommandQueueC8YMapping);
}

updateMOInstructionsArray(instructionsArray: SeriesInstruction[]) {
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
