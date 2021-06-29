import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomSimulator } from 'src/models/simulator.model';
import { Router } from '@angular/router';
import { SimulatorsBackendService } from '@services/simulatorsBackend.service';
import { ILabels } from '@models/labels.model';

@Component({
  selector: 'addCustomSimulator',
  styleUrls: ['./simulator-config.component.scss'],
  templateUrl: './simulator-config.component.html'
})
export class SimulatorConfigComponent {
  simulatorTitle: string = '';
  simModel: Partial<CustomSimulator> = {
    type: 'c8y_DeviceSimulator',
    owner: 'service_device-simulator',
    name: '',
    c8y_DeviceSimulator: {
      name: '',
      instances: 1,
      state: 'PAUSED',
      commandQueue: [],
      c8y_SupportedOperations: []
    },
    c8y_additionals: [],
    c8y_Series: []
  };
  labels: ILabels = {
    ok: 'Save',
    cancel: 'Cancel'
  };
  private closeSubject: Subject<any> = new Subject();

  constructor(private router: Router, private backendService: SimulatorsBackendService) {}

  saveSimulatorDetails() {
    this.simModel.c8y_DeviceSimulator.name = this.simulatorTitle;
    this.simModel.name = this.simulatorTitle;
    this.backendService.createSimulator(this.simModel.c8y_DeviceSimulator).then((result) => {
      const simulator = {
        type: 'c8y_DeviceSimulator',
        owner: 'service_device-simulator',
        name: result.name,
        c8y_CustomSim: {},
        id: result.id,
        c8y_DeviceSimulator: result,
        c8y_additionals: [],
        c8y_Series: []
      };
      this.backendService.addCustomSimulatorProperties(simulator).then((res) => {
        this.router.navigate(['/createSim/' + result.id]);
        this.onClose(true);
      });
    });
  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }
}
