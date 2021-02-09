import { TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";

@Component({
  selector: "app-sim-measurements",
  templateUrl: "./sim-measurements.component.html",
  styleUrls: ["./sim-measurements.component.scss"],
})
export class SimMeasurementsComponent implements OnInit {

  @Input() set measure(measurement) {
    if (measurement !== undefined) {
    this.measurement = measurement;
    console.log(this.measurement);
    this.fragment = this.measurement.fragment;
    this.series = this.measurement.series;
    this.minVal = this.measurement.minValue;
    this.maxVal = this.measurement.maxValue;
    this.unit = this.measurement.unit;
    this.steps = this.measurement.steps;
    }
  }

  get measure() {
    return this.measurement;
  }
  
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

      fragment: string;
      series: string;
      minValue: string;
      maxValue: string;
      steps: string;
      unit: string;
      sleep: string;

  };

  measurements = [];

  constructor(private service: MeasurementsService) {}

  ngOnInit() {}

  onChangeMsmt(val) {
    this.selectedMsmtOption = val;
  }

  removeMeasurementFromArray() {

  }

  addMsmtToArray() {
    // this.newFragmentAdded = true;
    this.measurement = {

        fragment: this.fragment ? this.fragment : "",
        series: this.series ? this.series : "",
        minValue: this.minVal ? this.minVal : "",
        maxValue: this.maxVal ? this.maxVal : "",
        steps: this.steps ? this.steps : "",
        unit: this.unit ? this.unit : "",
        sleep: this.sleep ? this.sleep : "",

    };

    this.service.measurements.push(this.measurement);
  }

}
