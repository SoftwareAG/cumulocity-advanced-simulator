import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-sim-measurements",
  templateUrl: "./sim-measurements.component.html",
  styleUrls: ["./sim-measurements.component.scss"],
})
export class SimMeasurementsComponent implements OnInit {
  @Output() msmt = new EventEmitter();
  measurementOptions = [
    "Measurement series one after another",
    "Alternate measurement series",
  ];
  selectedMsmtOption = this.measurementOptions[0];

  sleep: string;
  fragment: string;
  series: string;
  minVal: string;
  maxVal: string;
  steps: string;
  unit: string;

  measurement: {
    measurement: {
      fragment: string;
      series: string;
      minValue: string;
      maxValue: string;
      steps: string;
      unit: string;
      sleep: string;
    };
  };

  constructor() {}

  ngOnInit() {}

  onChangeMsmt(val) {
    this.selectedMsmtOption = val;
  }

  addMsmtToArray() {
    // this.newFragmentAdded = true;
    this.measurement = {
      measurement: {
        fragment: this.fragment ? this.fragment : "",
        series: this.series ? this.series : "",
        minValue: this.minVal ? this.minVal : "",
        maxValue: this.maxVal ? this.maxVal : "",
        steps: this.steps ? this.steps : "",
        unit: this.unit ? this.unit : "",
        sleep: this.sleep ? this.sleep : "",
      },
    };
    this.msmt.emit(this.measurement);
    this.fragment = "";
    this.maxVal = "";
    this.minVal = "";
    this.series = "";
    this.steps = "";
    this.unit = "";
  }
}
