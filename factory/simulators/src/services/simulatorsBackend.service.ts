import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { FetchClient } from "@c8y/ngx-components/api";
import { C8YDeviceSimulator, CustomSimulator } from "@models/simulator.model";
import { SimulatorsServiceService } from "./simulatorsService.service";

@Injectable({
  providedIn: "root",
})
export class SimulatorsBackendService {
  constructor(private alert: AlertService, private http: HttpClient, private simulatorService: SimulatorsServiceService) {}

  connectToSimulatorsBackend(resultTemplate, managedObjectId) {
    const url = `/service/device-simulator/simulators/${managedObjectId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    this.http
      .put(url, resultTemplate, httpOptions)
      .subscribe((data) => console.log('mo_data: ', data));
  }

  createSimulator(simulator: Partial<CustomSimulator>): Promise<any> {
    const url = `/service/device-simulator/simulators`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    return this.http
      .post(url, simulator,  httpOptions).toPromise();
      // .subscribe((data) => console.log('1st MO created: ', data));
  }

  addCustomSimulatorProperties(simulator: Partial<CustomSimulator>) {
    return this.simulatorService.updateSimulatorManagedObject(simulator);
  }
}
