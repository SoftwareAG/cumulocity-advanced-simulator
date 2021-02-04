import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { Subject, Subscription } from "rxjs";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { UpdateInstructionsService } from "../../services/updateInstructions.service";

@Component({
  selector: "app-simulator-details",
  templateUrl: "./simulator-details.component.html",
  styleUrls: ["./simulator-details.component.less"],
})
export class SimulatorDetailsComponent implements OnInit {
  commandQueue;
  @Output() currentValue = new EventEmitter();
  @Output() currentCommandQueue = new EventEmitter();
  @Output() insertSleepOrFragment = new EventEmitter();
  isInserted = false;
  showBtns = false;
  measurement: EditedMeasurement;
  subscription: Subscription;
  constructor(
    private service: UpdateInstructionsService,
    private settingsService: SimulatorSettingsService
  ) {}

  ngOnInit() {
    this.subscription = this.service.castMeasurement.subscribe((obs) => {
      this.measurement = obs;
      if (this.measurement) {
        this.editCurrent();
      }
    });
    this.settingsService.fetchCommandQueue().then((result) => {
      this.commandQueue = result;
    });
  }

  deleteMeasurementOrSleep(item) {
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    this.commandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.commandQueue);
  }

  updateCurrentValue(val) {
    if (val.type === "builtin") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      this.currentValue.emit({ value: val, index: pos });
      console.log("Ival " + JSON.stringify({ value: val, index: pos }));
    } else if (val.type === "sleep") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      // this.currentValue.emit({value: val, index: pos});
      console.log("Ival " + JSON.stringify({ value: val, index: pos }));
    }
  }

  editCurrent() {
    const pos = this.measurement.index;
    if (this.measurement.msmt.msgId === "200") {
      this.commandQueue[pos].values[0] = this.measurement.msmt.fragment;
      this.commandQueue[pos].values[1] = this.measurement.msmt.series;
      this.commandQueue[pos].values[2] = this.measurement.msmt.value;
      this.commandQueue[pos].values[3] = this.measurement.msmt.unit;
      // Insert backend save here
    }
  }

  fetchAddInstructionsOrSleepView() {
    this.service.setInstructionsView(true);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
