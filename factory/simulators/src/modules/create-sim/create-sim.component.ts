import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlarmService } from "@c8y/ngx-components/api";
import { AlarmsService } from "@services/alarms.service";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})

export class CreateSimComponent implements OnInit {
  measurementSeries = [];
  alarmSeries = [];
  commandQueue = [];
  data;
  mo;
  isExpanded = false;

  viewNewSeries = true;
  actionButtons = ['New Series', 'Existing series'];
  currentSelection: string = this.actionButtons[0];
  displayInstructionsView = false;
  editedVal;
  editedValue;
  
  constructor(
    private route: ActivatedRoute,
    private simSettings: SimulatorSettingsService
  ) {}
  
  getCurrentValue(event){
    this.editedValue = event;
  }
    
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue.filter(a => a);
    this.simSettings.fetchAllSeries(this.mo).then((res) => this.measurementSeries = res.map((entry) => ({...entry, active: false})));
  }

  updateViewState(val) {
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
  }

  selectButton(item: string) {
    this.currentSelection = item;
    const activeElement = document.activeElement;
    if (activeElement && activeElement instanceof HTMLButtonElement) {
      activeElement.blur();
    }
    this.currentSelection === this.actionButtons[0] ? this.viewNewSeries = true : this.viewNewSeries = false;
  }


}