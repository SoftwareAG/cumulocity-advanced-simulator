import { TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";

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
    // this.service.setMeasurements(this.measurements);
    this.fragment = "";
    this.maxVal = "";
    this.minVal = "";
    this.series = "";
    this.steps = "";
    this.unit = "";
  }

}
