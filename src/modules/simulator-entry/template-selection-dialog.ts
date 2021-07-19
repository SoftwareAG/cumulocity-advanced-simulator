import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { IManagedObject } from '@c8y/client';
import { C8YDeviceSimulator, CustomSimulator } from '@models/simulator.model';
import { TemplateModel } from '@models/template.model';
import { SimulatorsBackendService } from '@services/simulatorsBackend.service';
import { AdditionalParameter } from '@models/commandQueue.model';
import { SeriesInstruction } from '@models/instruction.model';
import { ILabels } from '@models/labels.model';
import * as _ from 'lodash';
@Component({
  selector: 'template-selection-dialog',
  template: ` <c8y-modal
    title="{{ modalTitle }}"
    (onClose)="createBulkSimulatorsFromTemplate($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="form-group">
        <br />
        <label>{{ 'Template' | translate }} *</label>
        <select
          class="form-control select-config"
          [(ngModel)]="simulatorTemplate"
          (ngModelChange)="onChange($event)"
          [ngModelOptions]="{ standalone: true }"
        >
          <option value="" disabled selected>{{ 'Select Template' | translate }}</option>
          <option *ngFor="let first of allSimulatorTemplates" [ngValue]="first">{{ first.name }}</option>
        </select>

        <br />
        <label>{{ 'Number of Instances' | translate }}</label>
        <input type="text" class="form-control" [(ngModel)]="instances" [ngModelOptions]="{ standalone: true }" />
        <br />

        <label>{{ 'Simulator Title Prefix' | translate }}</label>
        <input
          class="form-control"
          placeholder="(Optional)"
          [(ngModel)]="simulatorTitle"
          [ngModelOptions]="{ standalone: true }"
        />
      </div>
    </ng-form>
  </c8y-modal>`
})
export class TemplateSelectionDialog {
  private closeSubject: Subject<any> = new Subject();

  public labels: ILabels = {
    ok: 'Create Simulators from Template',
    cancel: 'Cancel'
  };
  public modalTitle = 'Choose from Existing Templates to Create Simulators';

  deviceSimulator: C8YDeviceSimulator;
  simulatorTemplate: TemplateModel;
  simulatorTitle: string;
  @Input() allSimulatorTemplates: IManagedObject[];
  instances = 1;
  constructor(private backendService: SimulatorsBackendService) {}

  onDismiss() {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }

  onChange(simulator: TemplateModel) {
    this.simulatorTemplate = simulator as TemplateModel;
  }

  async createBulkSimulatorsFromTemplate() {
    const templateId = this.simulatorTemplate.id;
    const { id, ...deviceSimulator } = this.simulatorTemplate.c8y_Template.c8y_DeviceSimulator;
    const additionals = this.simulatorTemplate.c8y_Template.c8y_additionals;
    const series = this.simulatorTemplate.c8y_Template.c8y_Series;
    const promiseArray = new Array<Promise<void>>();
    for (let i = 0; i < this.instances; i++) {
      promiseArray.push(
        this.createSimulatorInstanceFromTemplate(templateId, _.cloneDeep(deviceSimulator), i + 1, additionals, series)
      );
    }
    await Promise.all(promiseArray);
  }

  async createSimulatorInstanceFromTemplate(
    id: string,
    deviceSimulator: C8YDeviceSimulator,
    index: number,
    additionals: AdditionalParameter[],
    series: SeriesInstruction[]
  ) {
    deviceSimulator.name = this.simulatorTitle
      ? `${this.simulatorTitle}_#${index}`
      : `${this.simulatorTemplate.name}_#${index}`;
    const createdSimulator = await this.backendService.createSimulator(deviceSimulator);
    const simulator: Partial<CustomSimulator> = {
      type: 'c8y_DeviceSimulator',
      owner: 'service_device-simulator',
      name: deviceSimulator.name,
      c8y_CustomSim: {},
      id: createdSimulator.id,
      c8y_DeviceSimulator: deviceSimulator,
      c8y_additionals: additionals,
      c8y_Series: series,
      c8y_hasTemplate: true,
      c8y_TemplateId: id
    };

    await this.backendService.addCustomSimulatorProperties(simulator);
  }
}
