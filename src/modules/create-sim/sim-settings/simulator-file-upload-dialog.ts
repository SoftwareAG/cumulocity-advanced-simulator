import { Component, Input } from "@angular/core";
import { Subject } from "rxjs";
import { AlertService, Alert } from "@c8y/ngx-components";
import {
  IManagedObject,
  IManagedObjectBinary,
  InventoryBinaryService,
  InventoryService,
} from "@c8y/client";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { C8YDeviceSimulator, CustomSimulator } from "@models/simulator.model";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { IndexedCommandQueueEntry } from "@models/commandQueue.model";

export interface ILabels {
  ok?: string;
  cancel?: string;
}

@Component({
  selector: "simulator-file-upload-dialog",
  template: ` <c8y-modal
    title="{{ modalTitle }}"
    (onClose)="uploadFile($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="form-group">
        <br />
        <div class="input-group">
          <label translate>File to upload</label>
          <input
            type="file"
            class="form-control"
            (change)="selectFile($event.target.files)"
          />
        </div>
      </div>
    </ng-form>
  </c8y-modal>`,
})
export class SimulatorFileUploadDialog {
  private closeSubject: Subject<any> = new Subject();

  public labels: ILabels = {
    ok: "Upload",
    cancel: "Cancel",
  };
  public modalTitle: string = "Upload Simulator";

  files: File[];
  deviceSimulator: C8YDeviceSimulator;
  fileOutput;
  constructor(
    private alertService: AlertService,
    private inventoryBinary: InventoryBinaryService,
    private inventory: InventoryService,
    private updateService: ManagedObjectUpdateService,
    private backend: SimulatorsBackendService,
    private simSettingsService: SimulatorSettingsService
  ) {}

  selectFile(files: File[]) {
    this.files = files;
  }

  uploadFile(event) {
    const file = this.files[0];
    const mo: Partial<IManagedObject> = {
      name: file.name,
      type: file.type,
      customSim_Import: {},
    };
    this.inventoryBinary.create(file, mo).then(
      (result) => {
        this.readFileContent(file).then((res) => {
          const data = JSON.parse(res);
          if (
            this.instanceOfC8YDeviceSimulator(data.c8y_DeviceSimulator) &&
            (file.name.endsWith(".txt") || file.name.endsWith(".json"))
          ) {
            this.deviceSimulator = data.c8y_DeviceSimulator;
            this.deviceSimulator.id = this.updateService.mo.id;
            let simulator: CustomSimulator = this.updateService.mo;
            simulator.c8y_DeviceSimulator = this.deviceSimulator;
            simulator.c8y_additionals = data.c8y_additionals;
            simulator.c8y_Series = data.c8y_Series;
            simulator.name = data.c8y_DeviceSimulator.name;
            this.backend
              .addCustomSimulatorProperties(simulator)
              .then((res1) => {
                this.updateService.setManagedObject(simulator);
                this.updateService
                  .updateSimulatorObject(simulator)
                  .then((res2) => {
                    // sim settings indexed command queue, command queue, instruction series
                    let indexedCommandQueue: IndexedCommandQueueEntry[] = [];
                    indexedCommandQueue = this.simSettingsService.createIndexedCommandQueue(
                      res2.c8y_additionals,
                      res2.c8y_Series,
                      res2.c8y_DeviceSimulator.commandQueue
                    );
                    this.simSettingsService.setIndexedCommandQueue(
                      indexedCommandQueue
                    );
                    this.simSettingsService.setAllInstructionsSeries(
                      res2.c8y_Series
                    );
                  });
              });
          } else {
            this.updateService.simulatorUpdateFeedback(
              "danger",
              "The uploaded simulator is invalid. Please upload a compatible file!"
            );
          }
        });
      },
      (error) => {
        this.alertService.add({
          text: "Error while uploading File",
          type: "danger",
          timeout: 0,
        } as Alert);
        this.onDismiss(false);
      }
    );
  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(mo: IManagedObjectBinary) {
    this.closeSubject.next(mo);
  }

  readFileContent(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!file) {
        resolve("");
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const text = reader.result.toString();
        resolve(text);
      };

      reader.readAsText(file);
    });
  }

  instanceOfC8YDeviceSimulator(object: any): object is C8YDeviceSimulator {
    return true;
  }
}
