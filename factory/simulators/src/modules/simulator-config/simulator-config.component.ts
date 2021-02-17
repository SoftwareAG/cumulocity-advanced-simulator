import { Component, OnInit } from "@angular/core";
import { InventoryService } from "@c8y/ngx-components/api";
import { Subject } from "rxjs";
import { IManagedObject } from "@c8y/client";
import {
  CustomSimulator,
  DeviceSimulator,
  SimulatorModel,
} from "src/models/simulator.model";
import { Router } from "@angular/router";
export interface ILabels {
  ok?: string;
  cancel?: string;
}

@Component({
  selector: "addCustomSimulator",
  template: ` <c8y-modal
    title="Create custom Simulator"
    (onClose)="saveSimulatorDetails($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="inputs">
        <div class="form-group width-33">
          <label translate>Enter custom simulator instance name *</label>
          <input
            class="form-control"
            [(ngModel)]="simulatorTitle"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>
      </div>
    </ng-form>
  </c8y-modal>`,
})
export class SimulatorConfigComponent implements OnInit {
  private closeSubject: Subject<any> = new Subject();
  simulatorTitle: string = "";
  simModel: Partial<CustomSimulator> = {
    type: "c8y_DeviceSimulator",
    owner: "service_device-simulator",
    name: "",
    c8y_DeviceSimulator: {
      name: "",
      instances: 1,
      state: "PAUSED",
      commandQueue: [],
      c8y_SupportedOperations: [],
    },
    c8y_CustomSim: {},
    c8y_Series: [],
  };
  public labels: ILabels = {
    ok: "Save",
    cancel: "Cancel",
  };
  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {}

  ngOnInit() {}

  saveSimulatorDetails() {
    this.simModel.c8y_DeviceSimulator.name = this.simulatorTitle;
    this.simModel.name = this.simulatorTitle;
    this.inventoryService.create(this.simModel).then((result) => {
      console.log(result);
      const simulatorId = result.data.id;
      this.router.navigate(["/createSim/" + simulatorId]);
    });
  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }
}
