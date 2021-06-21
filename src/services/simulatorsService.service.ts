import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IdentityService, IManagedObject, InventoryService } from "@c8y/client";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
import { ManagedObjectService } from "./ManagedObject.service";
import { map } from 'rxjs/operators';
import { TemplateModel } from "@models/template.model";

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

  getAllTemplates() {
    const templateFilter = {
      query: `$filter=(has(${this.simulatorTemplateFragment}))`,
      pageSize: 1000
    }
    return this.getFilterInventoryResult(templateFilter);
  }

  getSimulatorTemplates() {
    const templateFilter = {
      query: `$filter=(has(${this.simulatorTemplateFragment}))`,
      pageSize: 1000,
    }
    return this.getFilterInventoryResult(templateFilter);
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

  createSimulatorTemplate(obj: Partial<TemplateModel>) {
    return this.createManagedObject(obj);
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

  updateTemplateManagedObject(mo: Partial<TemplateModel>) {
    return this.updateManagedObject(mo);
  }

  getFilteredManagedObjects(filter: any) {
    return this.getFilterInventoryResult(filter);
  }
}
