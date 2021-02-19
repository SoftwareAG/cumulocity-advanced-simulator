import { Component, OnInit } from '@angular/core';
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
  constructor() { }

  ngOnInit() {
  }

  saveCustomOperation() {

  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }

}
