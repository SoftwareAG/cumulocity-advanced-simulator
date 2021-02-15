import { TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { UpdateInstructionsService } from "@services/updateInstructions.service";

@Component({
  selector: "app-sim-measurements",
  templateUrl: "./sim-measurements.component.html",
  styleUrls: ["./sim-measurements.component.scss"],
})
export class SimMeasurementsComponent implements OnInit {
  isNotFirst = false;
  @Input() set seriesVal(measurement) {
    if (measurement !== undefined && measurement.fragment !== undefined) {
      this.measurement = measurement;
      console.log(this.measurement);
      this.isNotFirst = true;
      this.fragment = this.measurement.fragment;
      this.series = this.measurement.series;
      this.minVal = this.measurement.minValue;
      this.maxVal = this.measurement.maxValue;
      this.unit = this.measurement.unit;
      this.steps = this.measurement.steps;
      this.sleep = this.measurement.sleep;
      this.selectedButton = "Duplicate Measurement";
    }
  }

  get seriesVal() {
    return this.measurement;
  }

  measurementOptions = [
    "Measurement series one after another",
    "Alternate measurement series",
  ];
  selectedMsmtOption = this.measurementOptions[0];
  selectedButton: string = "Add Measurement";
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

  constructor(
    private service: MeasurementsService,
    private simService: SimulatorSettingsService,
    private instructionsService: UpdateInstructionsService
  ) {}

  ngOnInit() {}

  onChangeMsmt(val) {
    this.selectedMsmtOption = val;
  }

  removeMeasurementFromArray() {
    // console.log(
    //   this.service.toMeasurementTemplate(
    //     this.measurement,
    //     this.measurement.minValue
    //   )
    // );
    this.instructionsService.setDeletedMeasurement(this.measurement);
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
    if (!this.isNotFirst) {
      this.fragment = "";
      this.sleep = "";
      this.maxVal = "";
      this.minVal = "";
      this.steps = "";
      this.unit = "";
      this.series = "";
    }

    this.service.measurements.push(this.measurement);
    this.simService.allSeries.push(this.measurement);
    // this.service.measurementSeries.push(this.measurement);
  }
}
