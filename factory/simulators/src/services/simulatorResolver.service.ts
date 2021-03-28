import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomSimulator, DeviceSimulator } from 'src/models/simulator.model';
import { SimulatorsServiceService } from './simulatorsService.service';
import { IManagedObject, IResult } from "@c8y/client";

@Injectable({
  providedIn: 'root'
})
export class SimulatorResolverService implements Resolve<IResult<IManagedObject>>{

constructor(private service: SimulatorsServiceService) { }
resolve(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<IResult<IManagedObject>>|Promise<IResult<IManagedObject>>|IResult<IManagedObject> {
  return this.service.getSimulatorById(route.paramMap.get('id'));
}
}
