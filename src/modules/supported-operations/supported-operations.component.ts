import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { CustomSimulator } from '@models/simulator.model';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { CustomOperationComponent } from './custom-operation/custom-operation.component';

@Component({
  selector: 'app-supported-operations',
  templateUrl: './supported-operations.component.html',
  styleUrls: ['./supported-operations.component.scss']
})
export class SupportedOperationsComponent implements OnInit {
  data: any;
  mo: CustomSimulator;
  subscriptions = new Subscription(); // TODO private?
  defaultSupportedOperations = [
    { name: 'Configuration', fragment: 'c8y_Configuration', isActive: false },
    { name: 'Device restart', fragment: 'c8y_Restart', isActive: false },
    { name: 'Firmware update', fragment: 'c8y_Firmware', isActive: false },
    { name: 'Software update', fragment: 'c8y_Software', isActive: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private simulatorService: SimulatorsServiceService
  ) {}

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
  }

  addCustomOperationModal() {
    const modal = this.modalService.show(CustomOperationComponent);
    modal.content.mo = this.mo;
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  modalUnsubscribe() {
    this.subscriptions.unsubscribe();
  }

  changeOperationstate(operation) {
    operation.isActive = !operation.isActive;
    if (operation.isActive && !this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.includes(operation.fragment)) {
      this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.push(operation.fragment);
    } else if (
      !operation.isActive &&
      this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.includes(operation.fragment)
    ) {
      const deletePosition = this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.findIndex(
        (entry) => entry == operation.fragment
      );
      this.mo.c8y_DeviceSimulator.c8y_SupportedOperations.splice(deletePosition, 1);
    }
    this.simulatorService.updateSimulatorManagedObject(this.mo);
  }
}
