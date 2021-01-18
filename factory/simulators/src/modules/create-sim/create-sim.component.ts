import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { InventoryService, IManagedObject } from "@c8y/client";
import { DeviceSimulator } from "src/models/simulator.model";

@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})
export class CreateSimComponent implements OnInit {
  constructor(
    private router: Router,
    private inventory: InventoryService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {}

  resultTemplate = {
    instances: 1,
    state: "PAUSED",
    commandQueue: [],
    supportedOperations: {},
    name: "",
  };
  fileUrl;
  fragment: string;
  maxValue: string;
  minValue: string;
  series: string;
  steps: string;
  tempType: string;
  unit: string;
  configureSettings = false;
  defaultSleep: string;
  newFragmentAdded = false;

  template = {
    fragment: null,
    series: null,
    minValue: null,
    maxValue: null,
    steps: null,
    unit: null,
    tempType: "measurement",
  };
  data: any;

  defaultSleepMsmtConfig = [
    "Sleep after each measurement",
    "Sleep after each measurement group",
  ];
  selectedConfig: string = this.defaultSleepMsmtConfig[0];
  simulatorId: string;
  mo: DeviceSimulator;
  simulatorName: string;
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = (this.data.simulator.data);
    this.simulatorName = (this.data.simulator.data.c8y_CustomSimulator.name);
    this.resultTemplate.name = (this.data.simulator.data.c8y_CustomSimulator.name);
  }

  generateSimulatorRequest() {
    if (!this.newFragmentAdded) {
      this.resultTemplate.commandQueue = [];
    }
    let allSteps = 0;
    const measurements = [this.deepCopy(this.template)];
    for (let i = 0; i < measurements.length; i++) {
      let number = measurements[i];
      // console.log(measurements.length);
      measurements[i].fragment = this.fragment ? this.fragment : "";
      measurements[i].series = this.series ? this.series : "";
      measurements[i].minValue = this.minValue ? this.minValue : "";
      measurements[i].maxValue = this.maxValue ? this.maxValue : "";
      measurements[i].steps = this.steps ? this.steps : "";
      measurements[i].unit = this.unit ? this.unit : "";
    }

    // console.log(measurements);
    for (let value of measurements.filter((a) => a.fragment)) {
      allSteps += +value.steps;
      value.steps = +value.steps;
      value.minValue = +value.minValue;
      value.maxValue = +value.maxValue;
      let scaledArray = this.scale(value.minValue, value.maxValue, value.steps);

      for (let scaled of scaledArray) {
        let toBePushed = `{
                              "messageId": "200",
                              "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
                              }`;

        toBePushed = toBePushed.replace("FRAGMENT", value.fragment);
        toBePushed = toBePushed.replace("SERIES", value.series);
        toBePushed = toBePushed.replace("VALUE", scaled);
        toBePushed = toBePushed.replace("UNIT", value.unit);

        this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
        // TODO: Add sleep here to push to resultTemplate.commandQueue

        if (
          this.defaultSleep &&
          this.defaultSleep !== "" &&
          this.selectedConfig === this.defaultSleepMsmtConfig[0]
        ) {
          this.resultTemplate.commandQueue.push({
            type: "sleep",
            seconds: value.sleep ? value.sleep : this.defaultSleep,
          });
        }
      }
      if (
        this.defaultSleep &&
        this.defaultSleep !== "" &&
        this.selectedConfig === this.defaultSleepMsmtConfig[1]
      ) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: value.sleep ? value.sleep : this.defaultSleep,
        });
      }
    }
    // TODO: Add alarms here!
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  scale(min, max, steps) {
    let values = [min];
    let calcStep = (max - min) / steps;
    for (let i = 0; i < steps; i++) {
      values.push(+values[i] + calcStep);
    }
    return values;
  }

  onChange(newVal) {
    // console.log(newVal);
    this.selectedConfig = newVal;
  }

  addNewFragment() {
    this.newFragmentAdded = true;
    this.fragment = "";
    this.maxValue = "";
    this.minValue = "";
    this.series = "";
    this.steps = "";
    this.unit = "";
  }

  downloadJSON() {
    const blob = new Blob([JSON.stringify(this.resultTemplate)], {
      type: "application/json",
    });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(blob)
    );
  }
}
