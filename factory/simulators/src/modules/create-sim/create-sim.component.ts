import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { InventoryService, IManagedObject } from "@c8y/client";
import { CustomSimulator, DeviceSimulator } from "src/models/simulator.model";
import { ChartDataSets, ChartOptions } from "chart.js";
import * as moment from "moment";
import { Color, Label } from "ng2-charts";
import { SimulatorsBackendService } from "../../services/simulatorsBackend.service";
import { Alert, AlertService } from "@c8y/ngx-components";

@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})
export class CreateSimComponent implements OnInit {
  currentIndex: any;
  constructor(
    private router: Router,
    private inventory: InventoryService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private backendService: SimulatorsBackendService,
    private alertService: AlertService
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
  events= [];
  randomSelected = false;
  configureAlarms = false;
  configureEvents = false;
  value: string;
  alarmSteps: number;
  eventSteps: number;

  toDisplay = false;
  selectedAlarmType: string;
  selectedAlarmText: string;
  selectedEventType: string;
  selectedEventText: string;
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
  selectedAlarmCategory: string = this.alarmCategories[0].category;
  defaultSleepMsmtConfig = [
    "Sleep after each measurement",
    "Sleep after each measurement group",
  ];

  defaultAlarmsConfig = [
    "Generate repeated alarms",
    "Generate alarms after each measurement group",
    "Generate alarms after each measurement",
  ];

  defaultEventsConfig = [
    "Generate repeated alarms",
    "Generate alarms after each measurement group",
    "Generate alarms after each measurement",
  ];

  eventCategories = [
    { category: "Basic", code: 400 },
    { category: "Location Update", code: 401 },
    { category: "Location Update Device", code: 402 },
  ];
  selectedAlarmConfig = this.defaultAlarmsConfig[0];
  selectedEventConfig = this.defaultEventsConfig[0];
  selectedEventCategory = this.eventCategories[0].category;
  selectedConfig: string = this.defaultSleepMsmtConfig[0];
  selectedLatitude: string;
  selectedLongitude: string;
  selectedAltitude: string;
  selectedAccuracy: string;
  simulatorId: string;
  mo: CustomSimulator;
  simulatorName: string;
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.simulatorName = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.resultTemplate.name = this.data.simulator.data.c8y_DeviceSimulator.name;
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
    }

    // let scaledArray = this.scale(value.minValue, value.maxValue, value.steps);
    for (let value of this.testArray) {
      for (const { temp, index } of this.scale(
        value.minValue,
        value.maxValue,
        value.steps
      ).map((temp, index) => ({ temp, index }))) {
        let toBePushed = `{
                              "messageId": "200",
                              "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
                              }`;

        toBePushed = toBePushed.replace("FRAGMENT", value.fragment);
        toBePushed = toBePushed.replace("SERIES", value.series);
        toBePushed = toBePushed.replace("VALUE", temp);
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

        if (
          this.alarms &&
          this.selectedAlarmConfig === this.defaultAlarmsConfig[2] &&
          index < this.alarms.length
        ) {
          this.toAlarmTemplateFormat(this.alarms[index]);

        }

        if (
          this.events &&
          this.selectedEventConfig === this.defaultEventsConfig[2] &&
          index < this.events.length
        ) {
          this.toEventTemplateFormat(this.events[index]);
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

      if (
        this.alarms &&
        this.selectedAlarmConfig === this.defaultAlarmsConfig[1]
      ) {
        this.generateAlarms();
      }

      if (
        this.events &&
        this.selectedEventConfig === this.defaultEventsConfig[1]
      ) {
        this.generateEvents();
      }
    }

    const test = this.scaledArray.map((entry, i) => ({
      data: entry,
      label: this.testArray[i].series,
    }));

    this.displayChart = true;
    this.lineChartData = test;
    this.lineChartLabels = this.range(0, this.configureScaling(test), 1);

    if (this.selectedAlarmConfig === this.defaultAlarmsConfig[0]) {
      this.generateAlarms();
    }

    if (this.selectedEventConfig === this.defaultEventsConfig[0]) {
      this.generateEvents();
    }
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  configureScaleTest(arr: { data: number[]; label: string }[]) {
    if (this.defaultSleep !== "") {
      console.log(
        arr.map(
          (x) =>
            (x.data = this.arrayScalingToMax(
              x.data,
              x.data.length,
              this.defaultSleep
            ))
        )
      );
    }
  }

  configureScaling(arr: { data: number[]; label: string }[]) {
    let maxScale = Math.max(...Array.from(arr, (x) => x.data.length));
    // if (this.defaultSleep) {
    //   arr.map((x) => {
    //     x.data = this.arrayScalingToMax(
    //       x.data,
    //       x.data.length * parseInt(this.defaultSleep),
    //       this.defaultSleep
    //     );
    //     console.log('Length in config scaling '+ x.data);
    //   });

    return maxScale * parseInt(this.defaultSleep);
  }

  arrayScalingToMax(arr: number[], max: number, sleep: string) {
    let newArr = new Array(max * parseInt(sleep)).fill(0);
    return newArr.map(
      (x, i) => (x = i % parseInt(sleep) == 0 ? arr[i / parseInt(sleep)] : 0)
    );
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

  onChangeAlarmConfig(newVal) {
    this.selectedAlarmConfig = newVal;
  }

  onChangeOfAlarm(newVal) {
    this.selectedAlarmCategory = newVal;
  }

  onChangeEventConfig(newVal) {
    this.selectedEventConfig = newVal;
  }

  onChangeEvent(newVal) {
    this.selectedEventCategory = newVal;
  }
  generateAlarms() {
    for (let alarm of this.alarms.filter((a) => a.alarmText)) {
      let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
      this.toAlarmTemplateFormat(alarm);
      if (
        this.defaultSleep &&
        this.selectedAlarmConfig === this.defaultAlarmsConfig[0]
      ) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: this.defaultSleep,
        });
      }
    }
  }

  generateEvents() {
    for (let event of this.events.filter((a) => a.eventText)) {
      this.toEventTemplateFormat(event);
      if (
        this.defaultSleep &&
        this.selectedEventConfig === this.defaultEventsConfig[0]
      ) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: this.defaultSleep,
        });
      }
    }
  }

  toEventTemplateFormat(event) {
    let toBePushed = `{
      "messageId": "400",
      "values": ["TYPE", "TEXT"], "type": "builtin"
    }`;

    toBePushed = toBePushed.replace("TYPE", event.eventType);
    toBePushed = toBePushed.replace("TEXT", event.eventText);
    this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
  }

  toAlarmTemplateFormat(alarm) {
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

  addAlarmToArray() {
    // Change the array no here. Add additional measurement option
    if (
      this.selectedAlarmConfig === this.defaultAlarmsConfig[0] ||
      this.selectedAlarmConfig === this.defaultAlarmsConfig[1] ||
      this.selectedAlarmConfig === this.defaultAlarmsConfig[2]
    ) {
      const arr = [];
      for (let i = 0; i < this.alarmSteps; i++) {
        arr.push({
          category: this.selectedAlarmCategory,
          alarmType: this.selectedAlarmType,
          alarmText: this.selectedAlarmText,
        });
      }
      this.alarms.push(...arr);
      this.selectedAlarmText = "";
      this.selectedAlarmType = "";
    } else {
      this.alarms.push({
        category: this.selectedAlarmCategory,
        alarmType: this.selectedAlarmType,
        alarmText: this.selectedAlarmText,
      });
      this.selectedAlarmText = "";
      this.selectedAlarmType = "";
    }
  }
  addEventToArray() {
    if (
      this.selectedEventConfig === this.defaultEventsConfig[0] ||
      this.selectedEventConfig === this.defaultEventsConfig[1] ||
      this.selectedEventConfig === this.defaultEventsConfig[2]
    ) {
      const arr = [];
      for (let i = 0; i < this.eventSteps; i++) {
        arr.push({
          category: this.selectedEventCategory,
          eventType: this.selectedEventType,
          eventText: this.selectedEventText,
        });
      }
      this.events.push(...arr);
      this.selectedEventText = "";
      this.selectedEventType = "";
    }

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
      sleep: this.defaultSleep ? this.defaultSleep : "",
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

  updateCurrentFragment(val) {
    this.toDisplay = true;
    this.fragment = val.value.values[0];
    this.series = val.value.values[1];
    this.value = val.value.values[2];
    this.unit = val.value.values[3];
    this.currentIndex = val.index;
  }

  editCurrentFragment() {
    this.resultTemplate.commandQueue[this.currentIndex].values = [
      this.fragment,
      this.series,
      this.value,
      this.unit,
    ];
  }

  reset() {
    this.toDisplay = false;
  }
}
