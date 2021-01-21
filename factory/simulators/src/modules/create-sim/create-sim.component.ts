import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { InventoryService, IManagedObject } from "@c8y/client";
import { DeviceSimulator } from "src/models/simulator.model";
import { ChartDataSets, ChartOptions } from "chart.js";
import * as moment from "moment";
import { Color, Label } from "ng2-charts";

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
  displayChart = false;
  scaled: any[];
  alarms: { category: string; alarmType: string; alarmText: string }[] = [];
  randomSelected = false;

  selectedAlarmType: string;
  selectedAlarmText: string;
  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartColors: Color[] = [
    {
      borderColor: "black",
      backgroundColor: "rgb(15, 76, 123)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(224, 0, 14)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(230, 100, 0)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(0, 136, 0)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(224, 0, 127)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(255, 31, 45)",
    },
    {
      borderColor: "black",
      backgroundColor: "rgb(255, 240, 31)",
    },
  ];
  lineChartLegend = true;
  lineChartType = "bar";
  lineChartPlugins = [];

  measurements = [];
  testArray = [];
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
  scaledArray = [];
  alarmCategories: { category: string; code: number }[] = [
    { category: "Critical", code: 301 },
    { category: "Major", code: 302 },
    { category: "Minor", code: 303 },
  ];
  selectedAlarmCategory: string;
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
    this.mo = this.data.simulator.data;
    this.simulatorName = this.data.simulator.data.c8y_CustomSimulator.name;
    this.resultTemplate.name = this.data.simulator.data.c8y_CustomSimulator.name;
  }

  generateSimulatorRequest() {
    if (!this.newFragmentAdded) {
      this.resultTemplate.commandQueue = [];
    }
    let allSteps = 0;
    if (!this.newFragmentAdded) {
      this.measurements = [this.deepCopy(this.template)];
      // this.measurements.push(this.deepCopy(this.template));
      for (let i = 0; i < this.measurements.length; i++) {
        let number = this.measurements[i];
        this.measurements[i].fragment = this.fragment ? this.fragment : "";
        this.measurements[i].series = this.series ? this.series : "";
        this.measurements[i].minValue = this.minValue ? this.minValue : "";
        this.measurements[i].maxValue = this.maxValue ? this.maxValue : "";
        this.measurements[i].steps = this.steps ? this.steps : "";
        this.measurements[i].unit = this.unit ? this.unit : "";
      }
    } else {
      this.measurements.push({
        fragment: this.fragment ? this.fragment : "",
        series: this.series ? this.series : "",
        minValue: this.minValue ? this.minValue : "",
        maxValue: this.maxValue ? this.maxValue : "",
        steps: this.steps ? this.steps : "",
        unit: this.unit ? this.unit : "",
      });
    }

    for (let value of this.measurements.filter((a) => a.fragment)) {
      allSteps += +value.steps;
      value.steps = +value.steps;
      value.minValue = +value.minValue;
      value.maxValue = +value.maxValue;

      if (this.testArray.find((x) => x.fragment === value.fragment)) {
        const pos = this.testArray.findIndex(
          (x) => x.fragment === value.fragment
        );
        this.scaled = this.scale(value.minValue, value.maxValue, value.steps);
        const nowScaled = this.scale(
          value.minValue,
          value.maxValue,
          value.steps
        );
        this.scaledArray[pos].push(...nowScaled);
      } else {
        const nowScaled = this.scale(
          value.minValue,
          value.maxValue,
          value.steps
        );
        this.testArray.push(value);
        this.scaledArray.push(nowScaled);
      }

      let scaledArray = this.scale(value.minValue, value.maxValue, value.steps);
      for (let scaled of this.scaledArray) {
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

    const test = this.scaledArray.map((entry, i) => ({
      data: entry,
      label: this.testArray[i].series,
    }));

    this.displayChart = true;

    this.lineChartData = test;
    this.lineChartLabels = this.range(0, this.configureScaling(test), 1);

    // TODO: Add alarms here!
    if (this.selectedAlarmText && this.selectedAlarmType) {
      this.alarms.push({
        category: this.selectedAlarmCategory,
        alarmText: this.selectedAlarmText,
        alarmType: this.selectedAlarmType,
      });
      for (let alarm of this.alarms.filter((a) => a.alarmText)) {
        let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
        let toBePushed = `{
                      "messageId": "${
                        this.alarmCategories.find(
                          (x) => x.category === this.selectedAlarmCategory
                        ).code
                      }",
                      "values": ["TYPE", "TEXT", ""], "type": "builtin"
                    }`;

        toBePushed = toBePushed.replace("TYPE", alarm.alarmType);
        toBePushed = toBePushed.replace("TEXT", alarm.alarmText);
        this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
      }
    }
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  configureScaling(arr: { data: number[]; label: string }[]) {
    return Math.max(...Array.from(arr, (x) => x.data.length));
  }

  scale(min, max, steps) {
    let values = [min];
    if (!this.randomSelected) {
      let calcStep = (max - min) / steps;
      for (let i = 0; i < steps; i++) {
        values.push(+values[i] + calcStep);
      }
    } else {
      for (let i = 1; i < steps; i++) {
        values.push(Math.floor(Math.random() * (max - min)) + min);
      }
    }
    return values;
  }

  onChange(newVal) {
    this.selectedConfig = newVal;
  }

  onChangeOfAlarm(newVal) {
    this.selectedAlarmCategory = newVal;
  }

  addAlarmToArray() {
    this.alarms.push({
      category: this.selectedAlarmCategory,
      alarmType: this.selectedAlarmType,
      alarmText: this.selectedAlarmText,
    });
    this.selectedAlarmText = "";
    this.selectedAlarmType = "";
  }

  addNewFragment() {
    this.newFragmentAdded = true;
    this.measurements.push({
      fragment: this.fragment ? this.fragment : "",
      series: this.series ? this.series : "",
      minValue: this.minValue ? this.minValue : "",
      maxValue: this.maxValue ? this.maxValue : "",
      steps: this.steps ? this.steps : "",
      unit: this.unit ? this.unit : "",
    });
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

  range(start, end, step) {
    let arr = [];
    for (let i = start; i <= end; i += step) {
      arr.push(i.toString());
    }
    return arr;
  }
}
