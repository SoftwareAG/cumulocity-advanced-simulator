import { Component, Input, OnInit } from '@angular/core';
import { InventoryService } from "@c8y/ngx-components/api";
import { Subject } from "rxjs";
import { IManagedObject } from "@c8y/client";
import {
  CustomSimulator,
  DeviceSimulator,
  SimulatorModel,
} from "src/models/simulator.model";
import { Router } from "@angular/router";
import { SimulatorsServiceService } from '@services/simulatorsService.service';
export interface ILabels {
  ok?: string;
  cancel?: string;
}


@Component({
  selector: "addCustomOperation",
  template: ` <c8y-modal
    title="Add Custom Operation"
    (onClose)="saveCustomOperation($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="inputs">
        <div class="form-group width-33">
          <label translate>Custom Operation Type *</label>
          <input
            class="form-control"
            [(ngModel)]="customOperationTitle"
            placeholder="e.g. myCustomOperation (required)"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>
      </div>
    </ng-form>
  </c8y-modal>`,
})
export class CustomOperationComponent implements OnInit {
  private closeSubject: Subject<any> = new Subject();
  customOperationTitle: string;
  public labels: ILabels = {
    ok: "Save",
    cancel: "Cancel",
  };
  @Input() mo: CustomSimulator;
  constructor(private simulatorService: SimulatorsServiceService) { }

  ngOnInit() {
  }

  saveCustomOperation() {
    if (!this.mo.c8y_DeviceSimulator.hasOwnProperty("c8y_CustomOperations")) {
      this.mo.c8y_DeviceSimulator["c8y_CustomOperations"] = [];
    }
    this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.push(this.customOperationTitle);
    this.mo.c8y_DeviceSimulator.c8y_CustomOperations.push(this.customOperationTitle);
    this.simulatorService.updateSimulatorManagedObject(this.mo).then((res) => {}); // FIXME proper handling

  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }

}
