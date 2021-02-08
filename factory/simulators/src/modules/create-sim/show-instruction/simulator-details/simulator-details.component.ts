import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SimMeasurementsComponent } from "@modules/create-sim/sim-settings/sim-measurements/sim-measurements.component";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { UpdateInstructionsService } from "@services/updateInstructions.service";

@Component({
  selector: "app-simulator-details",
  templateUrl: "./simulator-details.component.html",
  styleUrls: ["./simulator-details.component.less"],
})
export class SimulatorDetailsComponent implements OnInit {
  @Input() commandQueue;
  @Output() currentValue = new EventEmitter();
  @Output() currentCommandQueue = new EventEmitter();
  isInserted = false;
  showBtns = false;
  measurement: EditedMeasurement;
  constructor(
    private service: UpdateInstructionsService
  ) {}

  ngOnInit() {
  }

  deleteMeasurementOrSleep(item) {
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    this.commandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.commandQueue);
    // TODO: Delete entry from managed object
  }

  updateCurrentValue(val) {
    if (val.type === "builtin") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      this.currentValue.emit({ value: val, index: pos });
    } else if (val.type === "sleep") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      this.currentValue.emit({value: val, index: pos});
    }
  }

  editCurrent() {    
    const pos = this.measurement.index;
      for (let i=0; i<this.commandQueue[pos].length; i++) {
        this.commandQueue[pos].values[i] = this.measurement.msmt[Object.keys(this.measurement.msmt)[i]];
      }

      // TODO: Insert backend save here and edit for alarms, events and sleep
    
  }

  fetchAddInstructionsOrSleepView() {
    this.service.setInstructionsView(true);
  }

  ngOnDestroy() {
  }
}
