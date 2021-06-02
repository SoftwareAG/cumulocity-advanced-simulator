import { Component, Input } from "@angular/core";
import { Subject } from "rxjs";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { C8YDeviceSimulator, CustomSimulator, SimulatorTemplate } from "@models/simulator.model";
import { SimulatorsServiceService } from "@services/simulatorsService.service";

export interface ILabels {
  ok?: string;
  cancel?: string;
}

@Component({
  selector: "save-simulator-template-dialog",
  template: ` <c8y-modal
    title="{{ modalTitle }}"
    (onClose)="createSimulatorTemplateWithName($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="form-group">
        <br />
        <!-- <div class="input-group"> -->
            <label translate>Enter name for simulator template *</label>
        <input class="form-control" [(ngModel)]="templateName" [ngModelOptions]="{standalone: true}">
        <!-- </div> -->
      </div>
    </ng-form>
  </c8y-modal>`,
})
export class SaveSimulatorTemplateDialog {
  private closeSubject: Subject<any> = new Subject();

  public labels: ILabels = {
    ok: "Save",
    cancel: "Cancel",
  };
  public modalTitle: string = "Save template";

  files: File[];
  templateName: string;
  deviceSimulator: C8YDeviceSimulator;
  constructor(
    private simulatorService: SimulatorsServiceService,
    private updateService: ManagedObjectUpdateService
  ) {}

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }

  createSimulatorTemplateWithName() {
      const deviceSimulator = this.updateService.mo.c8y_DeviceSimulator;
      deviceSimulator.name = '';
      deviceSimulator.state = 'PAUSED';
      deviceSimulator.id = '';
      const template: Partial<SimulatorTemplate> = {
          name: this.templateName,
          c8y_Simulator_Template: {},
          c8y_Template: deviceSimulator
      };
      this.simulatorService.createSimulatorTemplate(template).then((res) => {
          this.updateService.simulatorUpdateFeedback('success', 'Template has been created successfully');
      });
  }
}
