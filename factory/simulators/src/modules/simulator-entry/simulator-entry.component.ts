import { Component, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { IManagedObject } from "@c8y/client";
import { SimulatorConfigComponent } from "../simulator-config/simulator-config.component";
import { SimulatorsServiceService } from "../../services/simulatorsService.service";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
import { Router } from "@angular/router";
import { SimulatorsBackendService } from "../../services/simulatorsBackend.service";

@Component({
  selector: "app-simulator-entry",
  templateUrl: "./simulator-entry.component.html",
  styleUrls: ["./simulator-entry.component.less"],
})
export class SimulatorEntryComponent implements OnInit {
  subscriptions = new Subscription();
  allSimulators: IManagedObject[];
  instructionTypes: {
    category: {
      icon: string;
      type: string;
      break: boolean;
    };
  }[] = [
    { category: { icon: "sliders", type: "measurements", break: false } },
    { category: { icon: "bell", type: "alarms", break: false} },
    { category: { icon: "tasks", type: "events", break: false } },
    { category: { icon: "clock-o", type: "sleep", break: false} },
    { category: { icon: "sitemap", type: "smartRest", break: false} },
  ];
  listClass = 'interact-list';
  constructor(
    private modalService: BsModalService,
    private simService: SimulatorsServiceService,
    private router: Router,
    private backend: SimulatorsBackendService
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  openAddNewSimulatorDialog() {
    const modal = this.modalService.show(SimulatorConfigComponent);
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  
  onListTypeChange(layout: string) {
    this.listClass = layout;
  }


  modalUnsubscribe() {
    this.subscriptions.unsubscribe();
  }

  editSimulator(simulator: CustomSimulator) {
    this.router.navigate(["/createSim/" + simulator.id]);
  }

  onStateChange(simulator) {
    simulator.c8y_DeviceSimulator.state === "RUNNING"
      ? (simulator.c8y_DeviceSimulator.state = "PAUSED")
      : (simulator.c8y_DeviceSimulator.state = "RUNNING");

    this.simService.updateSimulatorManagedObject(simulator).then((res) => {
      console.log("State changed");
      const moId = res.id;
      this.backend.connectToSimulatorsBackend(
        simulator.c8y_DeviceSimulator,
        moId
      );
    });
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

  onDuplicateSelected(simulator) {
    let copyDeviceSim = JSON.parse(
      JSON.stringify(simulator.c8y_DeviceSimulator)
    );
    copyDeviceSim.name = simulator.name + " #(copy)";
    const copyIndices = simulator.c8y_Indices;
    const copySeries = simulator.c8y_Series;
    const copySimulator: Partial<CustomSimulator> = {
      name: simulator.name + " #(copy)",
      c8y_CustomSim: {},
      c8y_DeviceSimulator: copyDeviceSim,
      c8y_Indices: copyIndices,
      c8y_Series: copySeries,
    };
    this.simService
      .createCustomSimulator(copySimulator)
      .then((res) => console.log(res));
  }

  refreshList() {
    this.simService.getAllDevices().then((simulators) => {
      this.allSimulators = simulators.sort((entry1, entry2) => {
        const val1 = entry1.name.toLowerCase();
        const val2 = entry2.name.toLowerCase();
        return val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
      });
    });
  }
}
