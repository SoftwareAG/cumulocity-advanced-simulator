import { Injectable } from '@angular/core';
import { AlertService, Alert } from '@c8y/ngx-components';
import { IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { CustomSimulator, C8YDeviceSimulator } from '@models/simulator.model';
import { ManagedObjectUpdateService } from './ManagedObjectUpdate.service';
import { SimulatorsBackendService } from './simulatorsBackend.service';
import { SimulatorSettingsService } from './simulatorSettings.service';
import { TranslateService } from "@ngx-translate/core";
import {
  IManagedObject,
  IManagedObjectBinary,
  InventoryBinaryService,
} from "@c8y/client";

export interface ILabels {
  ok?: string;
  cancel?: string;
}
@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  public labels: ILabels = {
    ok: "Upload",
    cancel: "Cancel",
  };
constructor(private alertService: AlertService,
  private inventoryBinary: InventoryBinaryService,
  private updateService: ManagedObjectUpdateService,
  private backend: SimulatorsBackendService,
  private simSettingsService: SimulatorSettingsService,
  private translateService: TranslateService) { }

  upload(event) {
    console.log(event);
  }
}
