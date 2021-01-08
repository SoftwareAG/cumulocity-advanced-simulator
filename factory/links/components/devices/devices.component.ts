import { Component } from '@angular/core';
import { IManagedObject, InventoryService} from '@c8y/client';

@Component ({
    selector: 'app-devices',
    templateUrl: 'devices.component.html'
})
export class DevicesComponent{
    devices: IManagedObject[] = [];
    private filter: object = {
        fragmentType: 'c8y_IsDevice',
        withTotalPages: true,
        pageSize: 100
    };
    constructor(
        private inventory: InventoryService
    ) {
        this.loadDevices();
     }
    async loadDevices() {
        const { data, res, paging } = await  this.inventory.list(this.filter);
        this.devices = data
    }
}