import { IManagedObject, InventoryService } from '@c8y/client';

export abstract class ManagedObjectService {
    readonly customSimulatorFragment = "c8y_CustomSim";

    constructor(private inventory: InventoryService) { }

    public getFilterInventoryResult(filter?: any): Promise<IManagedObject[]> {
        return this.inventory.list(filter).then(result => result.data);
    }

    public createManagedObject<T>(mo: Partial<T>): Promise<T> {
        return this.inventory.create(mo).then(result => {
            const abc: T = result.data as any;
            return abc;
        });
    }

    public updateManagedObject<T>(mo: Partial<T>) {
        return this.inventory.update(mo).then(result => {
            const abc: T = result.data as any;
            return abc;
        });
    }

}
