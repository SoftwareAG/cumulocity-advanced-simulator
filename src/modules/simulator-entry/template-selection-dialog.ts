import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from "rxjs";
import {
  IManagedObject,
} from "@c8y/client";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { C8YDeviceSimulator, CustomSimulator } from "@models/simulator.model";
import { TemplateModel } from "@models/template.model";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";

export interface ILabels {
  ok?: string;
  cancel?: string;
}

@Component({
  selector: "template-selection-dialog",
  template: ` <c8y-modal
    title="{{ modalTitle }}"
    (onClose)="createBulkSimulatorsFromTemplate($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>

    <!-- <div class="form-group">
        <br />
        <div class="input-group">
          <label translate>File to upload</label>
          <input
            type="file"
            accept=".txt,.json"
            class="form-control"
            (change)="selectFile($event.target.files)"
          />
        </div>
      </div> -->


      <div class="form-group">
        <br />
        <!-- <div class="input-group"> -->
          <label translate>Select from saved templates *</label>
          <select class="form-control select-config" [(ngModel)]="simulatorTemplate" (ngModelChange)="onChange($event)" [ngModelOptions]="{standalone: true}">
      <option value="" disabled selected>Select from simulator templates</option>
      <option *ngFor="let first of allSimulatorTemplates" [ngValue]="first">{{ first.name }}</option>
    </select>
    <!-- </div> -->
    <br>
    <label translate>Select number of instances *
    </label>
    <input type="text" class="form-control" [(ngModel)]="instances" [ngModelOptions]="{standalone: true}">
        
      </div>
    </ng-form>
  </c8y-modal>`,
})
export class TemplateSelectionDialog implements OnInit {
  private closeSubject: Subject<any> = new Subject();

  public labels: ILabels = {
    ok: "Create bulk simulators",
    cancel: "Cancel",
  };
  public modalTitle: string = "Choose from existing templates to create bulk simulators";

  deviceSimulator: C8YDeviceSimulator;
  simulatorTemplate: TemplateModel;
  @Input() allSimulatorTemplates: IManagedObject[];
  instances = 1;
  constructor(
    private simulatorService: SimulatorsServiceService,
    private updateService: ManagedObjectUpdateService,
    private backendService: SimulatorsBackendService
  ) {}

  ngOnInit() {
    console.log(this.allSimulatorTemplates);
  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }

  onChange(simulator) {
    console.log('selected template: ', simulator);
    this.simulatorTemplate = simulator as TemplateModel;
  }

  createBulkSimulatorsFromTemplate() {
    const {id, ...deviceSimulator} = this.simulatorTemplate.c8y_Template;
    
    for (let i = 0;  i < this.instances; i++) {
    deviceSimulator.name = this.simulatorTemplate.name + '_#' + i.toString();
    this.backendService.createSimulator(deviceSimulator).then((res) => {
      const simulator: Partial<CustomSimulator> = {
        type: "c8y_DeviceSimulator",
        owner: "service_device-simulator",
        name: deviceSimulator.name,
        c8y_CustomSim: {},
        id: res.id,
        c8y_DeviceSimulator: res,
        c8y_additionals: [],
        c8y_Series: [],
      }
      this.backendService.addCustomSimulatorProperties(simulator).then((result) => {
        console.log('CustomSim Created here: ', res);
      });
    });
    }
  }

  
}
