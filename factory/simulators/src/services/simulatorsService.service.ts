import { Injectable } from "@angular/core";
import { IManagedObject, InventoryService } from "@c8y/client";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
// import { InventoryService } from '@c8y/ngx-components/api';
import { ManagedObjectService } from "./ManagedObject.service";

@Injectable({
  providedIn: "root",
})
export class SimulatorsServiceService extends ManagedObjectService {
  constructor(private inventoryService: InventoryService) {
    super(inventoryService);
  }

  getAllDevices() {
    const deviceFilter = {
      query: `$filter=(has(${this.customSimulatorFragment}))`,
      pageSize: 1000,
    };
    return this.getFilterInventoryResult(deviceFilter);
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
}
