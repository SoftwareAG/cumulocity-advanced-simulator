import { Injectable } from '@angular/core';
import { IManagedObject, InventoryService } from '@c8y/client';
// import { InventoryService } from '@c8y/ngx-components/api';
import { ManagedObjectService } from './ManagedObject.service';

@Injectable({
  providedIn: 'root'
})
export class SimulatorsServiceService extends ManagedObjectService{

constructor(private inventoryService: InventoryService) { 
  super(inventoryService);
}

getAllDevices() {
  const deviceFilter = {
      query: `$filter=(has(${this.customSimulatorFragment}))`,
      pageSize: 1000
  };
  return this.getFilterInventoryResult(deviceFilter);
}

getAllDevicesGroupedByType() {
  return this.getAllDevices().then(result => {
      const typeAttribute = 'type';
      const simulators = result.filter(tmp => tmp[typeAttribute] === this.customSimulatorFragment);
      return simulators;      
  });
}

}
