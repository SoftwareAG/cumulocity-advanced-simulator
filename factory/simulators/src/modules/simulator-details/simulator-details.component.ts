import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-simulator-details",
  templateUrl: "./simulator-details.component.html",
  styleUrls: ["./simulator-details.component.less"],
})
export class SimulatorDetailsComponent implements OnInit {
  @Input() commandQueue;
  @Output() currentValue = new EventEmitter();
  @Output() currentCommandQueue = new EventEmitter();
  @Output() insertSleepOrFragment = new EventEmitter();
  isInserted = false;
  showBtns = false;
  constructor() {}

  ngOnInit() {}

  deleteMeasurementOrSleep(item) {
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    console.log(pos);
    this.commandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.commandQueue);
  }

  addSleepOrMeasurement(item) {
    this.isInserted = true;
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    this.insertSleepOrFragment.emit({bool: this.isInserted, index: pos});
  }

  updateCurrentValue(val) {
    if (val.type === "builtin") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      this.currentValue.emit({ value: val, index: pos });
      console.log("Ival " + { value: val, index: pos });
    } else if (val.type === "sleep") {
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      // this.currentValue.emit({value: val, index: pos});
      console.log("Ival " + JSON.stringify({ value: val, index: pos }));
    }
  }
}
