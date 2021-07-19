import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IdentityService, IManagedObject, InventoryService } from "@c8y/client";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
import { ManagedObjectService } from "./ManagedObject.service";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class SimulatorsServiceService extends ManagedObjectService {
  constructor(private inventoryService: InventoryService, private http: HttpClient, private identityService: IdentityService) {
    super(inventoryService);
  }

  getAllDevices() {
    const deviceFilter = {
      query: `$filter=(has(${this.customSimulatorFragment}))`,
      pageSize: 1000,
    };
    return this.getFilterInventoryResult(deviceFilter);
  }

  fetchExternalIds(externalId: string) {
    return this.identityService.list(externalId);
  }

  createCustomSimulator(obj: Partial<CustomSimulator>) {
    return this.createManagedObject(obj).then((result) => {
      const res = result;
      return res;
    });
  }

  getSimulatorById(id: string) {
    return this.inventoryService.detail(id).then(result => {return result; });
  }

  getAllDevicesGroupedByType() {
    return this.getAllDevices().then((result) => {
      const typeAttribute = "type";
      const simulators = result.filter(
        (tmp) => tmp[typeAttribute] === this.customSimulatorFragment
      );
      return simulators;
    });
  }

  updateSimulatorManagedObject(mo: Partial<CustomSimulator>) {
    return this.updateManagedObject(mo);
  }

  getFilteredManagedObjects(filter: any) {
    return this.getFilterInventoryResult(filter);
  }
}
