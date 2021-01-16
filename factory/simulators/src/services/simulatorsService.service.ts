import { Injectable } from '@angular/core';
import { InventoryService } from '@c8y/ngx-components/api';
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
      query: `$filter=(has(${this.deviceSimulatorFragment}))`,
      pageSize: 1000
  };
  return this.getFilterInventoryResult(deviceFilter);
}
}
