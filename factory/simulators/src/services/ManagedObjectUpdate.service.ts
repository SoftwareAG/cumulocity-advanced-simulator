import { Injectable } from '@angular/core';
import { CustomSimulator } from '@models/simulator.model';
import { SimulatorsServiceService } from './simulatorsService.service';

@Injectable({
  providedIn: 'root'
})
export class ManagedObjectUpdateService {

mo: CustomSimulator;
constructor(private simService: SimulatorsServiceService) { }

setManagedObject(mo: CustomSimulator) {
  this.mo = mo;
}

updateSimulatorObject(mo: CustomSimulator) {
  return this.simService.updateSimulatorManagedObject(mo);
}

}
