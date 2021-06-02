import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IManagedObject } from '@c8y/client';
import { Alert, AlertService, ModalService } from '@c8y/ngx-components';
import { CustomSimulator } from 'src/models/simulator.model';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { SimulatorsBackendService } from '@services/simulatorsBackend.service';
import { SimulatorConfigComponent } from '../simulator-config/simulator-config.component';
import { version } from '../../../package.json';

@Component({
  selector: 'app-simulator-entry',
  templateUrl: './simulator-entry.component.html',
  styleUrls: ['./simulator-entry.component.scss']
})
export class SimulatorEntryComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  allSimulators: IManagedObject[];
  instructionTypes: {
    category: {
      icon: string;
      type: string;
      break: boolean;
    };
  }[] = [
    { category: { icon: 'sliders', type: 'measurements', break: false } },
    { category: { icon: 'bell', type: 'alarms', break: false } },
    { category: { icon: 'tasks', type: 'events', break: false } },
    { category: { icon: 'clock-o', type: 'sleep', break: false } },
    { category: { icon: 'sitemap', type: 'smartRest', break: false } }
  ];
  listClass = 'interact-list';
  appVersion: string;

  constructor(
    private modalService: BsModalService,
    private ngXmodalService: ModalService,
    private simService: SimulatorsServiceService,
    private router: Router,
    private backend: SimulatorsBackendService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.appVersion = version;
  }

  ngOnInit(): void {
    this.refreshList();
  }

  ngOnDestroy(): void {
    this.modalUnsubscribe();
  }

  openAddNewSimulatorDialog(): void {
    const modal = this.modalService.show(SimulatorConfigComponent);
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  deleteSimulatorPrompt(simulator: CustomSimulator): Promise<boolean> {
    return this.ngXmodalService
      .confirm(
        'Delete Simulator',
        'Do you want to delete the simulator "' + simulator.name + '"? This action cannot be undone.',
        'danger',
        {
          ok: 'Delete',
          cancel: 'Cancel'
        }
      )
      .then(
        () => {
          return this.deleteSimulator(simulator);
        },
        () => {
          // no actual handling required
          return false;
        }
      );
  }

  onListTypeChange(layout: string): void {
    this.listClass = layout;
  }

  modalUnsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  editSimulator(simulator: CustomSimulator): void {
    this.router.navigate(['/createSim/' + simulator.id]);
  }

  onStateChange(simulator: CustomSimulator): void {
    simulator.c8y_DeviceSimulator.state === 'RUNNING'
      ? (simulator.c8y_DeviceSimulator.state = 'PAUSED')
      : (simulator.c8y_DeviceSimulator.state = 'RUNNING');

    this.simService.updateSimulatorManagedObject(simulator).then((res) => {
      const moId = res.id;
      this.backend.connectToSimulatorsBackend(simulator.c8y_DeviceSimulator, moId);
    });
  }

  private deleteSimulator(simulator: CustomSimulator): Promise<boolean> {
    return this.simService.deleteManagedObject(simulator.id).then(
      () => {
        const pos = this.allSimulators.findIndex((entry) => entry.id === simulator.id);
        this.allSimulators.splice(pos, 1);

        this.refreshList();
        this.alertService.add({
          text: this.translateService.instant('Simulator deleted.'),
          type: 'success'
        } as Alert);
        return true;
      },
      (error) => {
        this.alertService.add({
          text: this.translateService.instant(error),
          type: 'danger',
          timeout: 0
        } as Alert);
        return false;
      }
    );
  }

  onDuplicateSelected(simulator: CustomSimulator): void {
    let copyDeviceSim = JSON.parse(JSON.stringify(simulator.c8y_DeviceSimulator));
    copyDeviceSim.name = simulator.name + ' #(copy)';
    const copyIndices = simulator.c8y_Indices;
    const copySeries = simulator.c8y_Series;
    const copySimulator: Partial<CustomSimulator> = {
      name: simulator.name + ' #(copy)',
      c8y_CustomSim: {},
      c8y_DeviceSimulator: copyDeviceSim,
      c8y_Indices: copyIndices,
      c8y_Series: copySeries
    };

    this.simService.createCustomSimulator(copySimulator).then(
      () => {
        this.refreshList();
        this.alertService.add({
          text: this.translateService.instant('Simulator duplicated.'),
          type: 'success'
        } as Alert);
      },
      (error) => {
        this.alertService.add({
          text: this.translateService.instant(error),
          type: 'danger',
          timeout: 0
        } as Alert);
      }
    );
  }

  refreshList(): void {
    this.simService.getAllDevices().then((simulators) => {
      this.allSimulators = simulators.sort((entry1, entry2) => {
        const val1 = entry1.name.toLowerCase();
        const val2 = entry2.name.toLowerCase();
        return val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
      });
    });
  }
}
