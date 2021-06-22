import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomSimulator } from '@models/simulator.model';
import { SimulatorsServiceService } from './simulatorsService.service';

@Injectable({
  providedIn: 'root'
})
export class SimulatorsBackendService {
  constructor(private http: HttpClient, private simulatorService: SimulatorsServiceService) {}

  connectToSimulatorsBackend(resultTemplate, managedObjectId) {
    const url = `/service/device-simulator/simulators/${managedObjectId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    this.http.put(url, resultTemplate, httpOptions).subscribe();
  }

  createSimulator(simulator: Partial<CustomSimulator>): Promise<any> {
    const url = `/service/device-simulator/simulators`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, simulator, httpOptions).toPromise();
  }

  addCustomSimulatorProperties(simulator: Partial<CustomSimulator>) {
    return this.simulatorService.updateSimulatorManagedObject(simulator);
  }
}
