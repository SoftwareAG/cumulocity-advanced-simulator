import { Component, OnInit } from '@angular/core';
import { BsModalService } from "ngx-bootstrap";
import { Subscription } from 'rxjs';
import { IManagedObject } from "@c8y/client";
import { SimulatorConfigComponent } from '../simulator-config/simulator-config.component';
import { SimulatorsServiceService } from '../../services/simulatorsService.service';
import { DeviceSimulator } from 'src/models/simulator.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simulator-entry',
  templateUrl: './simulator-entry.component.html',
  styleUrls: ['./simulator-entry.component.less']
})
export class SimulatorEntryComponent implements OnInit {

  subscriptions = new Subscription();
  allSimulators: IManagedObject[];
  constructor(private modalService: BsModalService,
    private simService: SimulatorsServiceService,
    private router: Router) { }

  ngOnInit() {
    this.simService.getAllDevices().then((simulators) => {this.allSimulators = simulators;
    console.log(simulators);});
  }

  openAddNewSimulatorDialog() {
    const modal = this.modalService.show(SimulatorConfigComponent);
    // modal.content.device = this.device;
    this.subscriptions.add(
        modal.content.closeSubject.subscribe((result) => {
            if (result) {
                console.log(result);
                // this.existing_trips.push(result);
            }
            this.modalUnsubscribe();
        }));
}

modalUnsubscribe() {
    this.subscriptions.unsubscribe();
}

editSimulator(simulator: DeviceSimulator) {
  console.log(simulator.id);
  this.router.navigate(['/createSim/' + simulator.id]);
}

}
