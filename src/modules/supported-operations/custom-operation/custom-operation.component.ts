import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomSimulator } from 'src/models/simulator.model';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { ILabels } from '@models/labels.model';

@Component({
  selector: 'addCustomOperation',
  styleUrls: ['./custom-operation.component.scss'],
  templateUrl: './custom-operation.component.html'
})
export class CustomOperationComponent {
  private closeSubject: Subject<any> = new Subject();
  customOperationTitle: string;
  public labels: ILabels = {
    ok: 'Save',
    cancel: 'Cancel'
  };
  @Input() mo: CustomSimulator;

  constructor(private simulatorService: SimulatorsServiceService) {}

  saveCustomOperation() {
    if (!this.mo.c8y_DeviceSimulator.hasOwnProperty('c8y_CustomOperations')) {
      this.mo.c8y_DeviceSimulator['c8y_CustomOperations'] = [];
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
