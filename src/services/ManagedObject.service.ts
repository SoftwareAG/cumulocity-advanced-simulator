import { IManagedObject, InventoryService } from '@c8y/client';

export abstract class ManagedObjectService {
    readonly customSimulatorFragment = "c8y_CustomSim";

    constructor(private inventory: InventoryService) { }

    public getFilterInventoryResult(filter?: any): Promise<IManagedObject[]> {
        return this.inventory.list(filter).then(result => result.data);
    }

    public createManagedObject<T>(mo: Partial<T>): Promise<T> {
        return this.inventory.create(mo).then(result => {
            const res: T = result.data as any;
            return res;
        });
    }

    public updateManagedObject<T>(mo: Partial<T>) {
        return this.inventory.update(mo).then(result => {
            const res: T = result.data as any;
            return res;
        });
    }

    public fetchManagedObject<T>(id: string) {
        return this.inventory.detail(id).then(result => {
            const res: T = result.data as any;
            return res;
        });
    }

    public deleteManagedObject<T>(id: string) {
        return this.inventory.delete(id).then(result => {
            const res: T = result.data as any;
            return res;
        });
    }

}
