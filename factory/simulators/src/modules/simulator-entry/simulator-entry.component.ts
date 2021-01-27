import { Component, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap";
import { Subscription } from "rxjs";
import { IManagedObject } from "@c8y/client";
import { SimulatorConfigComponent } from "../simulator-config/simulator-config.component";
import { SimulatorsServiceService } from "../../services/simulatorsService.service";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-simulator-entry",
  templateUrl: "./simulator-entry.component.html",
  styleUrls: ["./simulator-entry.component.less"],
})
export class SimulatorEntryComponent implements OnInit {
  subscriptions = new Subscription();
  isChecked = false;
  allSimulators: IManagedObject[];
  constructor(
    private modalService: BsModalService,
    private simService: SimulatorsServiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshList();
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
      })
    );
  }

  modalUnsubscribe() {
    this.subscriptions.unsubscribe();
  }

  editSimulator(simulator: CustomSimulator) {
    this.router.navigate(["/createSim/" + simulator.id]);
  }

  onStateChange(simulator) {
    this.isChecked = !this.isChecked;

    this.isChecked
      ? (simulator.c8y_DeviceSimulator.state = "RUNNING")
      : (simulator.c8y_DeviceSimulator.state = "PAUSED");

    this.simService
      .updateSimulatorManagedObject(simulator)
      .then((res) => console.log('State changed'));

  }

  onDeleteSelected(simulator) {
    this.simService.deleteManagedObject(simulator.id).then(() => {
      const pos = this.allSimulators.findIndex(
        (entry) => entry.id === simulator.id
      );
      this.allSimulators.splice(pos, 1);
      console.log("Successfully Deleted");
    });
  }

  refreshList() {
    this.simService.getAllDevices().then((simulators) => {
      this.allSimulators = simulators;
    });
  }
}
