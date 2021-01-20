import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DeviceSimulator } from 'src/models/simulator.model';
import { SimulatorsServiceService } from './simulatorsService.service';

@Injectable({
  providedIn: 'root'
})
export class SimulatorResolverService implements Resolve<DeviceSimulator>{

constructor(private service: SimulatorsServiceService) { }
resolve(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any>|Promise<any>|any {
  console.log(route);
  return this.service.getSimulatorById(route.paramMap.get('id'));
}
}
